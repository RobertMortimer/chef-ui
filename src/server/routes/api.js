/*
 API for remote access
 */

var express = require('express');
var router = express.Router();
const fs = require('fs');


/* Remotely add schema files
*
* */
router.post('/schema', async (req, res, next) => {
  const { schema, uiSchema, formData, name, password, username } = req.body;
  if (password !== process.env.ADMIN_PASS) res.json({ Error: 'password mis-match' });
  else if (!name) res.json({ Error: 'name field is required' });
  else {
    const promises = [];
    if (schema) {
      promises.push(fs.writeFile('./schemas/' + name + '.json', JSON.stringify(schema, '\t')));
    }
    if (uiSchema) {
      promises.push(fs.writeFile('./uiSchemas/' + name + '.json', JSON.stringify(uiSchema, '\t')));
    }
    if (formData) {
      promises.push(fs.writeFile('./schema/' + name + '.json', JSON.stringify(formData, '\t')));
    }
    try {
      await Promise.all(promises);
      res.json({ success: true });
    } catch (e) {
      res.json({ success: false, Error: 'Failed to write to file' });
    }

  }
});

module.exports = router;
