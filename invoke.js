let apiJoiner = require("./api-joiner.js")

try {
    apiJoiner.joinDocs({
        // folder path where all the docs are placed
        "docsPath": "./docs",

        // prefix to be used for output file name. file name e.g. some-api-2019-02-15T14:06:22.117Z
        "combinedDocPrefix": "some-api",

        // Open API 3 document info object
        "docInfo": {
            "title": "Some API",
            "description": "Some API description",
            "version": "v1",
            "x-logo": {
                "url": "logo.svg"
            }
        },

        // Server url for the apis
        "serverUrl": "http://some.api",

        // function to process the path before it is added to combined doc
        "pathProcessor": pathProcessor
    })
} catch (e) {
    console.log("Error in joining docs " + e)
}

/**
 * This is optional function in case you want to do some
 * custom processing before the api endpoint path is 
 * added to the combined doc
 * In this example, this function is removing any version details
 * and trailing slashes from the path
 * And it also throws exception for duplicate path
 */
function pathProcessor(combinedDoc, path1, docTitle) {
    // replace v1, /v1 & trailing slashes
    let path = path1
        .replace("/v1", "")
        .replace("v1", "")
        .replace(/(\/+$)/g, "")
    if (path[0] != "/") {
        path = "/" + path
    }
    let pathExists = combinedDoc.paths[path] != undefined
    if (pathExists) {
        throw "Duplicate path " + path + " in the doc " + docTitle
    }
    return path
}
