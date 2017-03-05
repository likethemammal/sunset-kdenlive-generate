//--copy the template project directory
//-- accept links as args
//-- get data from SC
//--import template files and feed in data
//add audio files to project dir
//rename project file and dir, include date in value



const fs = require('fs')
const data = {
    date: '1/2/3',
    time: '12:45 EST',
    music: [
        'https://soundcloud.com/l1fescape/butter',
        'https://soundcloud.com/l1fescape/butter',
        'https://soundcloud.com/l1fescape/butter',
    ]
}
const dir = 'generated/project'
const clipsDir = `${dir}/Clips`
const templateProjectDir = 'templates/project'
const templateTitleDir = 'templates/titles'
const templateSuffix = '.kdenlivetitle.ejs'
const fileTitleSuffix = '.kdenlivetitle'
const fileProjectSuffix = '.kdenlive'
const fileProject = `${dir}/SaaS${fileProjectSuffix}`
const fileProjectPrefix = 'SaaS.'
const SC_ID = '587aa2d384f7333a886010d5f52f302a';







init()





function init() {

    //todo: add dir copying
    
    getTemplateFiles(templateTitleDir, (templates) => {
        templates.map((template) => {

            const endOfKey = template.indexOf(templateSuffix)
            const key = template.substring(0, endOfKey)

            getTemplateValues(key, (values) => {
                createFileFromTemplate(key, values)
            })
        })
    })
}





//template
function getTemplateFiles(pathname, cb) {

    fs.readdir(pathname, (err, items) => cb(items));

    //todo: add error handling

}

function getTemplateValues(key, cb) {

    switch(key) {
        case 'music':
            //get soundcloud songs

            getSoundCloudSongs(data.music, cb)
            break
        case 'time':
        case 'date':
            cb({
                [key]: data[key]
            })
            break
        default:
            cb({})

    }
}

function createFileFromTemplate(key, values) {
    const src = `${templateTitleDir}/${key}${templateSuffix}`
    const UnderscoreTemplate = require('underscore.template');
    const template = UnderscoreTemplate(fs.readFileSync(src).toString());
    const file = template(values)
    const dest = `${dir}/${key}${fileTitleSuffix}`

    fs.writeFileSync(dest, file);
}





//moving files
function copyTemplateDir() {
    const fse = require('fs-extra')

    //todo: create new folder with name of date

    fse.ensureDir(dir, err => {
        if (err) return console.error(err)
        console.log("success!")

        fse.copy(templateProjectDir, dir, err => {
            if (err) return console.error(err)
            console.log("success!")
        })
    })
}

function renameProjectFile() {
    
    
    
    //get date from static data
    //create new date object from that
    //get m.d.yy format

    //move file from src to new renamed dest
}





//soundcloud
function getSoundCloudSongs(links, cb) {
    const wget = require('node-wget')

    // let args = process.argv
    //
    // args.shift()
    // args.shift()
    //
    // const links = args

    let artistName

    links.map((link, i) => {
        getSoundCloudSong(link, (song) => {
            const username = song.user.username
            const url = song.stream_url + '&client_id=' + SC_ID
            const title = song.title
            const endOfLinks = i === links.length - 1

            if (!artistName) {
                artistName = username
            } else if (artistName !== username) {
                artistName = 'Various'
            }

            wget({
                url: url,
                dest: `${dir}/${username} - ${title}.mp3`
            }, () => {

                //end of loop
                if (endOfLinks) {
                    cb({
                        artist: artistName
                    })
                }
            });
        })
    })
}

function getSoundCloudSong(link, cb) {
    const https = require('https')

    https.get(
        'https://api.soundcloud.com/resolve.json?url='+link+'/tracks&client_id='+SC_ID,
        ({headers}) => {

            const req = https.request(headers.location, (res) => {
                res.setEncoding('utf8');

                let dataStr = ''

                res.on('data', (data) => {
                    dataStr += data
                });

                res.on('end', (data) => {
                    cb(JSON.parse(dataStr))
                })
            })

            req.end();

        }).on('error', (e) => {
        console.error(e);
    });
}