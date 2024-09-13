class Global {
    private static instance: Global | null = null;
    public data: SingletonData = {};

    constructor(data: SingletonData = {}) {
        if (!Global.instance) {
            this.data = data;
            Global.instance = this;
        }
        return Global.instance;
    }

	static getInstance() {
		return new Global().data
	}
}

export default Global
