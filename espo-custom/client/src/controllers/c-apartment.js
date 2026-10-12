define('custom:controllers/c-apartment', ['controllers/record'], function (Record) {

    return Record.extend({

        // Адрес #CApartment/chessboard. Корпус можно передать: /chessboard/id=...
        actionChessboard: function (options) {
            options = options || {};

            this.main('custom:views/c-apartment/chessboard', {
                buildingId: options.id || null,
            });
        },
    });
});
