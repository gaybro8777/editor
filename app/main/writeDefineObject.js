import fs from 'fs';
import jszip from 'jszip';
import path from 'path';
import { app } from 'electron';

function writeDefineObject(mainWindow, defineObject, backupFlag) {
    let pathToDefines = path.join(app.getPath('userData'), 'defines');
    let outputFile;
    if (backupFlag === true) {
        outputFile = path.join(pathToDefines, 'backup.nogz');
    } else {
        outputFile = path.join(pathToDefines, defineObject.defineId + '.nogz');
    }

    let zip = new jszip();
    zip.file('odm.json', JSON.stringify(defineObject.odm));
    if (defineObject.hasOwnProperty('tabs')) {
        zip.file('tabs.json', JSON.stringify(defineObject.tabs));
    }
    // Write technical information
    let info = {
        datetime: new Date().toISOString(),
        appVersion: app.getVersion(),
        defineVersion: defineObject.odm.study.metaDataVersion.defineVersion,
    };
    if (defineObject.hasOwnProperty('userName')) {
        info.userName = defineObject.userName;
    }
    zip.file('info.json', JSON.stringify(info));

    function saveFile() {
        zip
            .generateNodeStream({
                type: 'nodebuffer',
                streamFiles: true,
                compression: 'DEFLATE'
            })
            .pipe(fs.createWriteStream(outputFile))
            .once('finish', () => {mainWindow.webContents.send('writeDefineObjectFinished', defineObject.defineId);});
    }

    fs.mkdir(pathToDefines, function(err) {
        if (err) {
            if (err.code == 'EEXIST') {
                saveFile();
            } else {
                throw new Error('Failed creating defines folder: ' + pathToDefines);
            }
        } else {
            saveFile();
        }
    });
}

module.exports = writeDefineObject;
