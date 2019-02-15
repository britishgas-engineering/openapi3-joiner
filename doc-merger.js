"use strict"

class DocMerger {

    constructor(combinedDoc, doc, pathProcessor) {
        this.combinedDoc = combinedDoc
        this.doc = doc
        this.pathProcessor = pathProcessor
    }

    mergeDoc() {
        if (this.combinedDoc) {
            const newDoc = this.newDocAfterRenamingSchemaReferences()
            this.updatePathsInCombinedDoc(newDoc.paths)
        } else {
            this.combinedDoc = this.doc
        }
        return this.combinedDoc
    }

    newDocAfterRenamingSchemaReferences() {
        const renamedSchemas = this.getRenamedSchemas()
        if (renamedSchemas.length > 0) {
            const docJson = JSON.stringify(this.doc);
            const schemaRef = (name) => "\"#/components/schemas/" + name.replace(/\//g, "~1") + "\""
            const newDocJson = renamedSchemas.reduce((accumulator, currentValue) => {
                return replaceAll(
                    accumulator,
                    schemaRef(currentValue.oldName),
                    schemaRef(currentValue.newName))
            }, docJson)
            const newDoc = JSON.parse(newDocJson)
            this.updateSchemasInCombinedDoc(newDoc.components.schemas, renamedSchemas)
            return newDoc
        } else {
            return this.doc
        }
    }

    updatePathsInCombinedDoc(paths) {
        for (let path in paths) {
            const path2 = (this.pathProcessor) ?
                this.pathProcessor(this.combinedDoc, path, this.doc.info.title) :
                path
            this.combinedDoc.paths[path2] = paths[path]
        }
    }

    getRenamedSchemas() {
        if (!this.doc.components || !this.doc.components.schemas) return []
        const newName = (oldName) => (oldName + "_" + this.doc.info.title)
            .replace(new RegExp("\\s", "g"), "_")

        return Object.keys(this.doc.components.schemas).map(schema => {
            return {
                "oldName": schema,
                "newName": newName(schema)
            }
        })
    }

    updateSchemasInCombinedDoc(schemas, renamedSchemas) {
        for (let schema in schemas) {
            const renamedSchema = this.renamedSchemaName(schema, renamedSchemas)
            this.combinedDoc.components.schemas[renamedSchema] = schemas[schema]
        }
    }

    renamedSchemaName(schema, renamedSchemas) {
        const filteredSchemas = renamedSchemas.filter(function (val, index, arr) {
            return val.oldName == schema
        })
        return (filteredSchemas.length == 1) ? filteredSchemas[0].newName : null
    }
}

function replaceAll(str, a, b) {
    return str.split(a).join(b)
}

module.exports = {
    // pathProcessor is needed in scenarios where you want to replace the path
    // /v1/appointments/ with /appointments
    // while merging it into combined doc
    // if not provided, same path will be used

    "mergeDoc": function (combinedDoc, doc, pathProcessor) {
        const docMerger = new DocMerger(combinedDoc, doc, pathProcessor)
        return docMerger.mergeDoc()
    }
}