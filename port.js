class Port {

    constructor (id, value) {
        this.id = id;
        this.value = value;
        this.connected = false;
        this.type = null;
    }

}

module.exports = Port;