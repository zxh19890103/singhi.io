const path = require("path")
const fs = require("fs")

const folder = path.resolve("../pages")

fs.readdir(folder, (err, files) => {
    if (err) throw err
    const g = files.entries()
    let md = ""
    const next = () => {
        const { value, done } = g.next()
        if (done) {
            writeToDisk(md)
            return
        }
        const file = value[1]
        md += `- [${genName(file)}](/pages/${file})`
        md += '\n'
        if (isFolder(file)) {
            const subfolder = `${folder}/${file}`
            fs.readdir(subfolder, (err, subfiles) => {
                if (err) throw err
                subfiles.forEach(subfile => {
                    md += `\t- [${genName(subfile)}](/pages/${file}/${subfile})`
                    md += '\n'
                })
                next()
            })            
        } else {
            next()
        }
    }
    next()
})

const writeToDisk = (content) => {
    const filepath = path.resolve("../index.md")
    fs.writeFile(filepath, content, (err) => {
        if (err) throw err
        else console.log("done!")
    })
}

/**
 * generate the valid title of a post.
 * @param {string} filename concat with dash.
 */
const genName = (filename) => {
    if (isFolder(filename)) {
        return capitalize(filename)
    } else {
        const words = filename
            .substr(0, filename.length - 3)
            .split('-')
            .map(capitalize)
            .join(' ')
        return words
    }
}

const capitalize = (word) => {
    return word[0].toUpperCase() + word.substr(1)
}

const isFolder = w => {
    return !w.endsWith(".md")
}