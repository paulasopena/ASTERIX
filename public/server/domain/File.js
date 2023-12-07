const fs = require("fs");
const CAT048 = require("./CAT048");

class File {
  constructor(path) {
    this.path = path;
    this.cat048 = [];
  }

  readFile() {
    const fileBuffer = fs.readFileSync(this.path);

    let i = 0;
    let counter = fileBuffer.readUInt8(2);

    let listByte = [];

    while (i < fileBuffer.length) {
      const array = fileBuffer.slice(i, i + counter);
      listByte.push(array);
      i += counter;

      if (i + 2 < fileBuffer.length) {
        counter = fileBuffer.readUInt8(i + 2);
      }
    }

    for (const arraystring of listByte) {
      const CAT = parseInt(arraystring[0].toString(16).padStart(2, "0"), 16);

      if (CAT === 48) {
        const newcat048 = new CAT048(arraystring);
        this.cat048.push(newcat048);
      }
    }
  }
}

module.exports = File;