const fs = require('fs');
const pathHelper = require('path');
const express = require('express');
const host = new (require('../infras/extensions/expressHost'))('api',console);
// host.configuration('./configs');
host.addPipelines(
    [
        express.json({limit:'1024mb'}),
        (require('cors'))(),
        express.urlencoded({limit:'1024mb',extended:true}),
        (require('cookie-parser'))(),
        (require('compression'))()
    ])
    .addRoutes(scanRoutes('',pathHelper.join(pathHelper.resolve(__dirname), 'routes')))
    .set('view engine', 'ejs')
    .set('case sensitive routing', true)
    .set('trust proxy', 1)
    .build(async host=> {

    })
;
function scanRoutes (prefix,filePath) {
    let result = [];
    fs.readdirSync(filePath, {withFileTypes: true}).map(file => {
        if (file.isDirectory()) {
            result = result.concat(scanRoutes(`${prefix}/${file.name}`, pathHelper.join(filePath, file.name)))
        } else if (file.name.endsWith('.js')) {
            result.push({
                area: `${prefix}/${pathHelper.parse(file.name).name}`,
                source: `${filePath}/${file.name}`
            })
        }
    });
    return result;
}

module.exports = host;