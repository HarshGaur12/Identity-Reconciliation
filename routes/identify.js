const express = require("express");
const router = express.Router();
const db = require("../db.js"); // Import database connection

router.post("/identify", (req, res) => {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
        return res.status(400).json({ error: "Email or Phone Number is required" });
    }

    let query = `SELECT * FROM contacts WHERE email = '${email}' OR phoneNumber = '${phoneNumber}'`;
    db.query(query, (err, contacts) => {
        if (err) {
            console.error("Error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        if (contacts.length === 0) {
            // No match found, create new primary contact
            let insertQuery = `INSERT INTO contacts (email, phoneNumber, linkPrecedence) VALUES ('${email}', '${phoneNumber}', 'primary')`;
            db.query(insertQuery, (err, result) => {
                if (err) {
                    console.error("Error:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                return res.status(200).json({
                    primaryContactId: result.insertId,
                    emails: email ? [email] : [],
                    phoneNumbers: phoneNumber ? [phoneNumber] : [],
                    secondaryContactIds: [],
                });
            });
        } else {
            // Existing contact found
            let primaryContact = contacts.find(c => c.linkPrecedence === "primary") || contacts[0];
            let isNewContact = !contacts.some(c => c.email === email || c.phoneNumber === phoneNumber);

            if (isNewContact) {
                let insertQuery = `INSERT INTO contacts (email, phoneNumber, linkedId, linkPrecedence) VALUES ('${email}', '${phoneNumber}', ${primaryContact.id}, 'secondary')`;
                db.query(insertQuery, (err) => {
                    if (err) {
                        console.error("Error:", err);
                        return res.status(500).json({ error: "Internal Server Error" });
                    }
                });
            }

            let linkedQuery = `SELECT * FROM contacts WHERE id = ${primaryContact.id} OR linkedId = ${primaryContact.id}`;
            db.query(linkedQuery, (err, linkedContacts) => {
                if (err) {
                    console.error("Error:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }

                let emails = [...new Set(linkedContacts.map(c => c.email).filter(Boolean))];
                let phoneNumbers = [...new Set(linkedContacts.map(c => c.phoneNumber).filter(Boolean))];
                let secondaryContactIds = linkedContacts.filter(c => c.linkPrecedence === "secondary").map(c => c.id);

                res.status(200).json({
                    primaryContactId: primaryContact.id,
                    emails,
                    phoneNumbers,
                    secondaryContactIds,
                });
            });
        }
    });
});

module.exports = router;