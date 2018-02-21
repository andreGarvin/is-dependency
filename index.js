const http = require('http')
const { parse } = require('url')
const { existsSync, readdirSync } = require('fs')

const registryUrl = 'https://registry.npmjs.org'

const request = (url) => {
    const { host, port, path } = parse(url)
    
    return new Promise((resolve, reject) => {
        const req = http.request({
            host,
            port,
            path,
            method: 'GET'
        }, res => {
            let buffer = new Buffer([])
            res.on('data', data => {
                buffer = Buffer.concat([buffer, data])
            })
            res.on('end', () => {
                try {
                    const data = JSON.parse(buffer.toString())
                    return resolve(data)
                } catch (err) {
                    return reject(new Error('Cloud not parse json data'))
                }
            })
        })
        req.on('error', err => {
            return reject(err)
        })
        req.end()
    })
}

const notFalsey = (x) => ![undefined, false, 0, null, ''].includes(x)

function checkForDependency(names, dependencies) {
    if (Array.isArray(names)) {

        const resp = {};
        for (let i in names) {
            const name = names[i]
            for (let j in dependencies) {
                const dependency = dependencies[j]

                if ( names.includes(dependency) && dependencies.includes(name) ) {
                    resp[name] = true;
                } else {
                    resp[name] = false;
                }
            }
        }
        return resp
    }

    for (let i in dependencies) {
        const pkg = dependencies[i]
        if (names === pkg) {
            return true
        }
    }
    return false   
}

module.exports = async (...args) => {
    if (args.length === 0) {
        throw new Error('This function excepts one or more arguements but receviced none arguement')
        return;
    } else if (args.length === 1 && notFalsey(args[0]) && args[0].trim().length !== ''){
        const nodeModulesPaths = require.main.paths
        
        for(let i in nodeModulesPaths) {
            if (existsSync(nodeModulesPaths[i])) {
                return readdirSync(nodeModulesPaths[i]).includes(args[0])
            }
        }
        return false;
    }

    if (args.length === 2) {
        let [trgPkg, names] = args,
            pkgVersion = undefined;
        
        if (trgPkg.indexOf('@') !== -1) {
            const [name, version]= trgPkg.split('@')
            trgPkg = name
            pkgVersion = version
        }

        const res = await request(`${registryUrl}/${trgPkg}?version=${pkgVersion ? pkgVersion : '' }`)
        
        if (!pkgVersion) {
            const { versions } = res

            const dependencies = Object.keys(versions[res['dist-tags'].latest].dependencies)
            return checkForDependency(names, dependencies)
        } else {
            return checkForDependency(
                names,
                Object.keys(res.dependencies)
            )
        }
    }
}