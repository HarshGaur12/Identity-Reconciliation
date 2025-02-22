const express = require("express");
const router = express.Router();
const db = require("../db"); // Import database connection

router.post("/identify", async (req, res) => {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
        return res.status(400).json({ error: "Email or Phone Number is required" });
    }

    try {
        let query = `SELECT * FROM contacts WHERE email = ? OR phoneNumber = ?`;
        let [contacts] = await db.promise().execute(query, [email, phoneNumber]);

        if (contacts.length === 0) {
            // No match found, create new primary contact
            let insertQuery = `INSERT INTO contacts (email, phoneNumber, linkPrecedence) VALUES (?, ?, 'primary')`;
            let [result] = await db.promise().execute(insertQuery, [email, phoneNumber]);

            return res.status(200).json({
                primaryContactId: result.insertId,
                emails: [email].filter(Boolean),
                phoneNumbers: [phoneNumber].filter(Boolean),
                secondaryContactIds: [],
            });
        }

        // Existing contact found
        let primaryContact = contacts.find(c => c.linkPrecedence === "primary") || contacts[0];

        // If the current contact is new but related, create a secondary contact
        let isNewContact = !contacts.some(c => c.email === email || c.phoneNumber === phoneNumber);
        if (isNewContact) {
            let insertQuery = `INSERT INTO contacts (email, phoneNumber, linkedId, linkPrecedence) VALUES (?, ?, ?, 'secondary')`;
            await db.promise().execute(insertQuery, [email, phoneNumber, primaryContact.id]);
        }

        // Fetch all linked contacts
        let [linkedContacts] = await db.promise().execute(
            `SELECT * FROM contacts WHERE id = ? OR linkedId = ?`,
            [primaryContact.id, primaryContact.id]
        );

        let emails = [...new Set(linkedContacts.map(c => c.email).filter(Boolean))];
        let phoneNumbers = [...new Set(linkedContacts.map(c => c.phoneNumber).filter(Boolean))];
        let secondaryContactIds = linkedContacts.filter(c => c.linkPrecedence === "secondary").map(c => c.id);

        res.status(200).json({
            primaryContactId: primaryContact.id,
            emails,
            phoneNumbers,
            secondaryContactIds,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
