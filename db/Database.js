const { promises: fs } = require('fs');
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');

class Database {
    constructor(filePath) {
        this.filePath = filePath;
    }

    async loadDB() {
        const data = await fs.readFile(this.filePath);
        return JSON.parse(data);
    }

    pathToArray(path) {
        if (path) return path.split('/'); else return [];
    }

    arrayToPath(array) {
        return _.join(array, '/');
    }

    async get(path) {
        const db = await this.loadDB();
        
        const data = _.get(db, this.pathToArray(path));
        return data;
    }

    async getArray(path) {
        const db = await this.loadDB();

        const data = _.values(_.get(db, this.pathToArray(path)));
        return data;
    }

    async set(path, value) {
        const db = await this.loadDB();

        _.set(db, this.pathToArray(path), value);
        await fs.writeFile(this.filePath, JSON.stringify(db));
        return true;
    }

    async increase(path, amount=1) {
        const db = await this.loadDB();
        const parsed = this.pathToArray(path);
        let data = _.get(db, parsed);
        data += amount;
        _.set(db, parsed, data);
        return await fs.writeFile(this.filePath, JSON.stringify(db));
    }

    async push(path, value) {
        const id = uuidv4();
        let pathArray = this.pathToArray(path);
        pathArray.push(id);
        const fullPath = this.arrayToPath(pathArray);

        if (value) {
            return await this.set(fullPath, value);
        } else {
            return { path: fullPath, id: id };
        }
    }

    async orderedList(path, sortBy, sortOrder='asc') {
        let list = await this.get(path);

        let sorted = _.orderBy(list, (o) => {
            return o[sortBy];
        }, sortOrder);
        return sorted;
    }

    static timestamp() {
        return _.now();
    }

    async remove(path) {
        const db = await this.loadDB();
        const parsed = this.pathToArray(path);
        _.unset(db, parsed);
        return await fs.writeFile(this.filePath, JSON.stringify(db));
    }

    async update(path, value) {
        const db = await this.loadDB();
        const parsed = this.pathToArray(path);

        for (const property in value) {
            parsed.push(property);
            if (value[property] != null) {
                _.set(db, parsed, value[property]);
            } else { // If value is null
                _.unset(db, parsed);
            }
        }
        await fs.writeFile(this.filePath, JSON.stringify(db));
        return await this.get(path);
    }
}



module.exports = Database;