export class EventEmitter {
    constructor() {
        this._events = new Map()
    }

    on(event, listener) {
        if (!this._events.has(event)) {
            this._events.set(event, new Set())
        }

        this._events.get(event).add(listener)
        return () => this.off(event, listener)
    }

    off(event, listener) {
        if (event === undefined && listener === undefined) {
            this._events.clear()
        } else if (listener === undefined) {
            this._events.delete(event)
        } else if (this._events.get(event).has(listener)) {
            this._events.get(event).delete(listener)
        }
    }

    emit(event, ...args) {
        if (this._events.has(event)) {
            for (const listener of this._events.get(event)) {
                listener(...args)
            }
        }
    }

    once(event, listener) {
        const off = this.on(event, (...args) => {
            listener(...args)
            off()
        })
    }
}
