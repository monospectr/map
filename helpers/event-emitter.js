export class EventEmitter {
    #events = new Map()

    on(event, listener) {
        if (!this.#events.has(event)) {
            this.#events.set(event, new Set())
        }

        this.#events.get(event).add(listener)
        return () => this.off(event, listener)
    }

    off(event, listener) {
        if (event === undefined && listener === undefined) {
            this.#events.clear()
        } else if (listener === undefined) {
            this.#events.delete(event)
        } else if (this.#events.get(event).has(listener)) {
            this.#events.get(event).delete(listener)
        }
    }

    emit(event, ...args) {
        if (this.#events.has(event)) {
            setTimeout(() => {
                for (const listener of this.#events.get(event)) {
                    listener(...args)
                }
            }, 0)
        }
    }

    once(event, listener) {
        const off = this.on(event, (...args) => {
            listener(...args)
            off()
        })
    }
}
