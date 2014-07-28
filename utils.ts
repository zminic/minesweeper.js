export interface IEvent<T> {
    on(handler: { (data?: T): void });
    one(handler: { (data?: T): void });
    off(handler: { (data?: T): void });
}

interface HandlerObject<T>
{
    handler: (data?: T) => void;
    options: {
        isOneTime?: boolean
    }
}

export class Event<T> implements IEvent<T>
{
    private handlers: HandlerObject<T>[] = [];

    public on(handler: { (data?: T): void })
    {
        this.handlers.push({
            handler: handler,
            options: {}
        });
    }

    public one(handler: { (data?: T): void })
    {
        this.handlers.push({
            handler: handler,
            options: { isOneTime: true }
        });
    }

    public off(handler: { (data?: T): void }) {
        this.handlers = this.handlers.filter(h => h.handler !== handler);
    }

    public trigger(data?: T) {
        if (this.handlers) {
            this.handlers.forEach(h => {
                h.handler(data)
                if (h.options.isOneTime)
                    this.off(h.handler);
            });

        }
    }
}