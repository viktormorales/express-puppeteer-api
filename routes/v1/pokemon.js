const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const cors = require('cors');

/**
 * GET /
 * Pokemon list
 * 
 * @param   {string}    token - Application token
 * @returns {string}    Pokemon list
 */
router.get("/", cors(), (req, res, cb) => {
    const token = req.query.token;
    
    // Validate token
    if (token !== process.env.TOKEN) {
        res.status(400)
        res.json({message:"Empty or invalid token"});
        return cb();
    }
    
    // If everything is OK, launch puppeteer
    puppeteer.launch({headless: true,args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]}).then(async function(browser) {
        
            // Open a new page and set the DOM Elements
        const page = await browser.newPage();
        try {
            
            page.goto(`https://pokemondb.net/pokedex/all`, {
                waitUntil: 'networkidle2'
            });
            
            await Promise.all([
                page.waitForSelector('table#pokedex'),
                page.waitForNavigation({ waitUntil: 'networkidle2' }),
            ]);

            const pokemon = await page.evaluate(() => {
                let rows = Object.values(document.querySelectorAll('table#pokedex tbody tr')).map(row => {
                    let id = row.querySelector('td:nth-child(1) .infocard-cell-data')
                    let name = row.querySelector('td:nth-child(2)')
                    let type = row.querySelector('td:nth-child(3)')

                    return {
                        id: id ? id.innerText : null,
                        name: name ? name.innerText : null,
                        type: type ? type.innerText : ""
                    }
                })
                return rows;
            })
            
            // Collect the information, send response and close the browser
            res.json({
                data: {
                    count: pokemon.length,
                    pokemon
                }
            })
        } catch (err) {
            res.json({ message: err.message });
        } finally {
            await browser.close();
        }
    });
})

/**
 * GET /:name
 * Get information of an specific pokemon name
 * 
 * @param   {string}    name - Pokemon name
 * @param   {string}    token - Application token
 * @returns {string}    Pokemon details
 */
router.get("/:name", cors(), function(req, res, cb) {
    // Query Values
    const token = req.query.token;
    const name = req.params.name;

    // Validate token
    if (token !== process.env.TOKEN) {
        res.status(400)
        res.json({message:"Empty or invalid token"});
        return cb();
    }

    // Validate information
    if (!name) {
		res.status(400);
        res.json({ message: "Bad request" });
        return cb();
    }
    
    // If everything is OK, launch puppeteer
    puppeteer.launch({headless: true,args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]}).then(async function(browser) {
        // Open a new page and set the DOM Elements to inspect
        const page = await browser.newPage();
        try {
            
            await page.goto(`https://pokemondb.net/pokedex/bulbasaur/${name}`, {
                waitUntil: 'networkidle2'
            });

            const pokemon = await page.evaluate(() => {
                let vitals = document.querySelector('main#main table.vitals-table > tbody')

                // National ID
                let id = vitals.querySelector('tr:nth-child(1) > td');

                // Type
                let type = vitals.querySelector('tr:nth-child(2) > td');

                // Species
                let species = vitals.querySelector('tr:nth-child(3) > td');

                // height
                let height = vitals.querySelector('tr:nth-child(4) > td');

                // weight
                let weight = vitals.querySelector('tr:nth-child(5) > td');

                // Table information
                
                let evolutions = Array.from(document.querySelectorAll('.infocard-list-evo'), row => {
                    let columns = row.querySelectorAll('.infocard');
                    return Array.from(columns, column => column.innerText);
                });
                
                return {
                    id: id ? id.innerText : "",
                    type: type ? type.innerText : "",
                    species: species ? species.innerText : "",
                    height: height ? height.innerText : "",
                    weight: weight ? weight.innerText : "",
                    evolution: evolutions
                }


            })
            
            // Collect the information and send response
            res.json({
                data: {
                    pokemon
                }
            })
        } catch (err) {
            res.json({ message: err.message });
        } finally {
            await browser.close();
        }
    });

});

module.exports = router;
