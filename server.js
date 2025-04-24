const { response } = require("express");
const express = require("express");
const sqlite3 = require("sqlite3");

const app = express();
const db = new sqlite3.Database("compito.db");
const PORT = 5000;

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

function serverError(errorObject) {
    let response = {
        code: -1,
        message: errorObject.message,
    }
    return response;
}
function clientError(errorMessage) {
    let response = {
        code: -1,
        message: errorMessage,
    }
    return response;
}

app.get("/biglietti", (req, res) => {
    db.all(`SELECT * FROM biglietto`,
    (err, rows) => {
        if (err) {
            const error = serverError(err);
            res.status(500).send(error);
            return;
        }

        let response = {
            code: 1,
            message: rows,
        }
        res.status(200).send(response);
    });
})

app.post("/biglietto", (req, res) => {
    const entrata = req.body.entrata;
    if (!entrata) {
        const error = clientError("Data di entrata non valorizzata");
        res.status(400).send(error);
        return;
    }
    
    const randomId = String(Math.random()).replace("0.", "");

    db.run(`INSERT INTO biglietto (id, entrata) VALUES
            (?, ?)`, [randomId, entrata],
        (err, results) => {
            if (err) {
                const error = serverError(err);
                res.status(500).send(error);
                return;
            }

            let response = {
                code: 1,
                message: results,
            }
            res.status(200).send(response);
    });
})

app.get("/biglietti/:id", (req, res) => {
    const id = req.params.id;
    
    db.get(`SELECT * FROM biglietto
            WHERE id = ?`, [id],
    (err, rows) => {
        if (err) {
            const error = serverError(err);
            res.status(500).send(error);
            return;
        }
        if (!rows) {
            const error = clientError("Nessun biglietto trovato");
            res.status(400).send(error);
            return;
        }

        let response = {
            code: 1,
            message: rows,
        }
        res.status(200).send(response);
    });
})

app.put("/biglietto/:id", (req, res) => {
    const id = req.params.id;
    let uscita = Math.floor(Math.random() * 300000) + 500;

    db.serialize(() => {
        // db.get(`SELECT * FROM biglietto
        //         WHERE id = ?`, [id],
        // (err, rows) => {
        //     if (err) {
        //         const error = serverError(err);
        //         res.status(500).send(error);
        //         return;
        //     }
        // });

        db.run(`UPDATE biglietto
                SET uscita = ?
                WHERE id = ?`, [uscita, id],
        (err, results) => {
            if (err) {
                const error = serverError(err);
                res.status(500).send(error);
                return;
            }
    
            let response = {
                code: 1,
                message: results,
            }
            res.status(200).send(response);
        });
    })
})

app.get("/pagamento/:id", (req, res) => {
    const id = req.params.id;

    db.get(`SELECT entrata, uscita FROM biglietto
            WHERE id = ?`, [id],
    (err, rows) => {
        if (err) {
            const error = serverError(err);
            res.status(500).send(error);
            return;
        }
        if (!rows) {
            const error = clientError("Nessun biglietto trovato");
            res.status(400).send(error);
            return;
        }

        let msEntrata = rows.entrata;
        let msUscita = rows.uscita;
        let costo = (((msUscita - msEntrata) / 60000) * 0.01).toFixed(2);

        let response = {
            code: 1,
            message: costo,
        }
        res.status(200).send(response);
    });
})

app.delete("/biglietto/:id", (req, res) => {
    const id = req.params.id;
    
    db.run(`DELETE FROM biglietto
            WHERE id = ?`, [id],
    (err, results) => {
        if (err) {
            const error = serverError(err);
            res.status(500).send(error);
            return;
        }

        let response = {
            code: 1,
            message: results,
        }
        res.status(200).send(response);
    });
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})