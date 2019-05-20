JSON Data Driver
=====================

A fork of [react-json-form](https://mozilla-services.github.io/react-jsonschema-form/).
Most of the project is built upon the library

## Changes from React JSON Form
- Removed code editors that display Schema, UI Schema and Form Data
- Changed Schemas from JS to JSON
- Changed some webpack and babel config
- Added Download function to save form data
- Added Upload function - the app will select the schema if schema_name is specified.
Otherwise, the user is given the option to select a schema
- Added Clear function to clear forms
- Added an Express Server that keeps tracks of schema files and passes down to a template 
that renders the React page

## Usage
Clone the repository and run`npm install`
### Production Mode
run `npm run server`

### Development Mode
Use `npm run dev-server` to run node.js server (port 3000). 
Use `npm run start` for developing react page (port 8080). 

I have not changed the other script commands, so they should still work. 

## License
Apache 2
