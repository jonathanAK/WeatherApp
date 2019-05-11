module.exports.Cache = Cache;

class Cache{
    timeOut= 3600000;
    cacheMem= {};

    hash = (str) =>{
        let hash = '0';
        let i;
        let chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = '0' + (chr%8) + hash + chr;
            hash = (parseInt(hash, 36)%60446175).toString(36);
        }
        return hash;
    };

    call = (call) =>{
        const p = new Promise((resolve, reject) => {
            let hash = this.hash(call);
            if (this.cacheMem.hasOwnProperty(hash) && (Date.now() - this.timeOut < this.cacheMem[hash].time)) {
                resolve(this.cacheMem[hash].value.clone());
            } else {
                resolve(
                    fetch(call)
                        .then(response => {
                            this.cacheMem[hash] = {time: Date.now(), value: response};
                            return (response.clone());
                        })
                );
            }
        });
        return p;
    };
}
