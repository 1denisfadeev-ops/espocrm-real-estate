define('custom:views/dashlets/c-test', ['views/dashlets/abstract/base'], function (Base) {

    return Base.extend({

        name: 'CTest',

        templateContent: `
            <div style="padding: 12px">
                <div style="font-size: 16px; font-weight: 600">Кастомный код загружается</div>
                <div class="text-muted small">EspoCRM {{version}} · путь custom:views/dashlets/c-test</div>
            </div>
        `,

        data: function () {
            return {
                version: this.getConfig().get('version'),
            };
        },
    });
});
