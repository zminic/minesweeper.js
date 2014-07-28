define(["require", "exports"], function(require, exports) {
    var Event = (function () {
        function Event() {
            this.handlers = [];
        }
        Event.prototype.on = function (handler) {
            this.handlers.push({
                handler: handler,
                options: {}
            });
        };

        Event.prototype.one = function (handler) {
            this.handlers.push({
                handler: handler,
                options: { isOneTime: true }
            });
        };

        Event.prototype.off = function (handler) {
            this.handlers = this.handlers.filter(function (h) {
                return h.handler !== handler;
            });
        };

        Event.prototype.trigger = function (data) {
            var _this = this;
            if (this.handlers) {
                this.handlers.forEach(function (h) {
                    h.handler(data);
                    if (h.options.isOneTime)
                        _this.off(h.handler);
                });
            }
        };
        return Event;
    })();
    exports.Event = Event;
});
//# sourceMappingURL=utils.js.map
