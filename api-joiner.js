"use strict"

const fs = require("fs")
const jsYaml = require("js-yaml")

const docMerger = require("./doc-merger.js")

// This is the big doc which would be created
// after joining all indivdual API docs
const $ = {
    "combined": {
        "doc": {},
        "docPrefix": ""
    },
    "pathProcessor": null
}

function getNewDoc(info, serverUrl) {
    return {
        "openapi": "3.0.0",
        "info": info,
        "servers": [
            {
                "url": serverUrl,
                "variables": {}
            }
        ],
        "paths": {},
        "components": {
            "schemas": {}
        }
    }
}

function joinDocs(input) {
    $.combined.doc = getNewDoc(input.docInfo, input.serverUrl)
    $.combined.docPrefix = input.combinedDocPrefix
    $.pathProcessor = input.pathProcessor
    console.log("docsPath => ", input.docsPath, "\n\n")
    const docs = docList(input.docsPath)
    console.log("docList ", docs)
    docs.forEach(function (docName, index) {
        let isCombinedDoc = docName.startsWith($.combined.docPrefix)
        let isYamlOrJson = [".yaml", ".yml", ".json"].some(ext => docName.toLowerCase().endsWith(ext))
        console.log(docName, isCombinedDoc)
        if (!isCombinedDoc && isYamlOrJson) {
            const docPathAbsolute = input.docsPath + "/" + docName;
            mergeIntoCombinedDoc(docPathAbsolute);
        }
        console.log("\n==\n")
    })
    const combinedDocName = documentName(input.docsPath)
    console.log("combinedDocName ", combinedDocName)
    writeToFile(combinedDocName)
    console.log("Total number of paths", Object.keys($.combined.doc.paths).length)
    console.log("Total number of schemas", Object.keys($.combined.doc.components.schemas).length)
    return {
        "yaml": combinedDocName + ".yaml",
        "json": combinedDocName + ".json"
    }
}

function docList(docsPath) {
    const files = fs.readdirSync(docsPath)
    const filelist = []
    files.forEach(function (file) {
        filelist.push(file)
    });
    return filelist
}


function mergeIntoCombinedDoc(docPathAbsolute) {
    console.log(docPathAbsolute);
    const doc = jsYaml.safeLoad(fs.readFileSync(docPathAbsolute, 'utf8'));
    try {
        docMerger.mergeDoc($.combined.doc, doc, $.pathProcessor);
    } catch (e) {
        console.log("Error converting doc ", doc.info.title, e);
    }
}

function writeToFile(docName) {
    writeJsonDoc(docName)
    writeYamlDoc(docName)
}

function writeJsonDoc(docName) {
    fs.writeFileSync(
        docName + ".json",
        JSON.stringify($.combined.doc),
        (err) => {
            if (err) throw err
        }
    )
}

function documentName(docPath) {
    return docPath + "/" + $.combined.docPrefix + "-" + new Date().toISOString()
}

function writeYamlDoc(docName) {
    fs.writeFileSync(
        docName + ".yaml",
        jsYaml.safeDump($.combined.doc),
        (err) => {
            if (err) throw err
        }
    )
}

module.exports = {
    "joinDocs": joinDocs
}
