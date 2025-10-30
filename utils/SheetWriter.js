

export class SheetWriter {
    constructor({ range, batchSize = 750, flushDelay = 300, maxRetries = 3 }) {
        this.range = range
        this.batchSize = batchSize
        this.flushDelay = flushDelay
        this.maxRetries = maxRetries

        this.buffer = []
        this.writeQueue = Promise.resolve()
        this.flushTimer = null
    }

    enqueue(row) {
        this.buffer.push(row)
        //if the buffer is full, flush now.
        if (this.buffer.length >= this.batchSize)
            this.flushNow()
        //otherwise set it to flush after the intended delay
        else
            this.scheduleFlush()
    }

    scheduleFlush() {
        if (this.flushTimer) return
        this.flushTimer = setTimeout(() => {
            this.flushNow()
        }, this.flushDelay)
    }

    flushNow() {
        if (this.buffer.length === 0)
            return
        const batch = this.buffer
        this.buffer = []
        clearTimeout(this.flushTimer)
        this.flushTimer = null

        this.writeQueue = this.writeQueue.then(() => {
            this.tryAppendWithRetries(batch)
        })
    }

    async tryAppendWithRetries(values, retries = this.maxRetries, baseDelay = 400) {
        try {
            console.log(`🟢 Appending ${values.length} rows starting with ${values[0][1]} and ending with ${values[values.length - 1][1]}`);
            const response = await editSpreadsheet(range, 'USER_ENTERED', values)
            console.log("✅ Google Sheets append success");
            return response;
        } catch (err) {
            if (retries <= 0) throw err;

            const delay = baseDelay * Math.pow(2, this.maxRetries - retries); // exponential backoff
            console.warn(`⚠️ Append failed (${err.message}). Retrying in ${delay}ms...`);
            await sleep(delay);
            return tryAppendWithRetries(values, retries - 1, baseDelay);
        }

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        // const delay = ms => new Promise(res => setTimeout(res, ms))
        // let attempt = 0
        // while (attempt <= retries) {
        //     try {
        //         //make google call
        //     } catch (err) {
        //         attempt++
        //         if (attempt > retries) throw err
        //         const backoff = 500 * 2 ** (attempt - 1)
        //         const delay = baseDelay * Math.pow(2, MAX_RETRIES - retries);
        //     }
        // }
    }
}