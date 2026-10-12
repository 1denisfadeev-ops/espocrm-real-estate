define('custom:views/c-apartment/chessboard', ['view'], function (View) {

    const STATUS_LIST = ['Free', 'Booked', 'Sold'];

    return View.extend({

        templateContent: `
            <div class="apt-page">
            <style>
                .apt-page { position: relative; }
                .apt-head { display: flex; justify-content: space-between; align-items: center;
                    gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
                .apt-head-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
                .apt-title { margin: 0; }
                .apt-select { width: auto; min-width: 200px; display: inline-block; }
                .apt-legend { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 16px; font-size: 13px; }
                .apt-legend-item { display: flex; align-items: center; gap: 6px; }
                .apt-legend-count { font-weight: 600; }
                .apt-dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; flex: none; }
                .apt-dot-Free { background: #5cb85c; }
                .apt-dot-Booked { background: #f0ad4e; }
                .apt-dot-Sold { background: #d9534f; }
                .apt-board-scroll { overflow-x: auto; padding-bottom: 10px; }
                .apt-board { display: grid; gap: 6px; min-width: min-content; }
                .apt-floor { display: flex; align-items: center; justify-content: center;
                    font-size: 12px; opacity: .55; }
                .apt-cell { border: 1px solid rgba(127, 127, 127, .25); border-left-width: 4px;
                    border-radius: 6px; padding: 6px 8px; cursor: pointer; }
                .apt-cell:hover { box-shadow: 0 2px 8px rgba(0, 0, 0, .18); }
                .apt-cell-empty { border: 1px dashed rgba(127, 127, 127, .18); cursor: default; }
                .apt-cell-empty:hover { box-shadow: none; }
                .apt-status-Free { background: rgba(92, 184, 92, .14); border-left-color: #5cb85c; }
                .apt-status-Booked { background: rgba(240, 173, 78, .18); border-left-color: #f0ad4e; }
                .apt-status-Sold { background: rgba(217, 83, 79, .13); border-left-color: #d9534f; }
                .apt-cell-top { display: flex; justify-content: space-between; align-items: center; }
                .apt-num { font-weight: 600; }
                .apt-menu-btn { opacity: .45; padding: 0 3px; cursor: pointer; line-height: 1; }
                .apt-menu-btn:hover { opacity: 1; }
                .apt-meta { font-size: 11px; opacity: .7; }
                .apt-price { font-size: 12px; margin-top: 2px; white-space: nowrap; }
                .apt-status-menu { position: absolute; z-index: 1000; }
                .apt-status-menu > li > a { display: flex; align-items: center; gap: 8px; cursor: pointer; }
                .apt-empty { padding: 24px 0; }
            </style>

                <div class="apt-head">
                    <div class="apt-head-left">
                        <h3 class="apt-title">{{translate 'Chessboard' category='labels' scope='CApartment'}}</h3>
                        {{#if hasBuildings}}
                        <select class="form-control apt-select" data-action="selectBuilding">
                            {{#each buildings}}
                            <option value="{{id}}" {{#if selected}}selected{{/if}}>{{name}}</option>
                            {{/each}}
                        </select>
                        {{/if}}
                    </div>
                    <div class="apt-actions">
                        <button class="btn btn-default btn-sm" data-action="refresh">
                            <span class="fas fa-sync-alt"></span>
                        </button>
                        <a href="#CApartment" class="btn btn-default btn-sm">{{translate 'CApartment' category='scopeNamesPlural'}}</a>
                    </div>
                </div>

                {{#if hasBuildings}}
                <div class="apt-legend">
                    {{#each summary}}
                    <div class="apt-legend-item">
                        <span class="apt-dot apt-dot-{{key}}"></span>
                        <span class="apt-legend-label">{{label}}</span>
                        <span class="apt-legend-count">{{count}}</span>
                        <span class="apt-legend-sum text-muted">{{sum}}</span>
                    </div>
                    {{/each}}
                </div>

                {{#if hasRows}}
                <div class="apt-board-scroll">
                    <div class="apt-board" style="grid-template-columns: 56px repeat({{columnCount}}, minmax(108px, 1fr))">
                        {{#each rows}}
                        <div class="apt-floor">{{floor}}</div>
                        {{#each cells}}
                            {{#if empty}}
                            <div class="apt-cell apt-cell-empty"></div>
                            {{else}}
                            <div class="apt-cell apt-status-{{status}}" data-id="{{id}}" data-action="openApartment"
                                title="{{tooltip}}">
                                <div class="apt-cell-top">
                                    <span class="apt-num">{{number}}</span>
                                    {{#if ../../canEdit}}
                                    <span class="apt-menu-btn" data-action="openMenu" title="Статус">⋮</span>
                                    {{/if}}
                                </div>
                                <div class="apt-meta">{{meta}}</div>
                                <div class="apt-price">{{price}}</div>
                            </div>
                            {{/if}}
                        {{/each}}
                        {{/each}}
                    </div>
                </div>
                {{else}}
                <div class="apt-empty text-muted">
                    В этом корпусе ещё нет квартир. Добавьте их в разделе «Квартиры» —
                    в шахматке они встанут по полям «Этаж» и «Позиция на этаже».
                </div>
                {{/if}}
                {{else}}
                <div class="apt-empty text-muted">
                    Сначала добавьте корпус в разделе «Корпуса», затем квартиры в нём.
                </div>
                {{/if}}

                <ul class="dropdown-menu apt-status-menu"></ul>
            </div>
        `,

        events: {
            'change [data-action="selectBuilding"]': function (e) {
                this.buildingId = e.currentTarget.value;
                this.reload();
            },
            'click [data-action="refresh"]': function () {
                this.reload();
            },
            'click [data-action="openMenu"]': function (e) {
                e.stopPropagation();
                this.openStatusMenu($(e.currentTarget).closest('.apt-cell'));
            },
            'contextmenu .apt-cell[data-id]': function (e) {
                if (!this.canEdit) {
                    return;
                }

                e.preventDefault();
                this.openStatusMenu($(e.currentTarget));
            },
            'click [data-action="openApartment"]': function (e) {
                this.openApartment($(e.currentTarget).attr('data-id'));
            },
        },

        setup: function () {
            this.buildingId = this.options.buildingId || null;
            this.buildings = [];
            this.apartments = [];
            this.rows = [];
            this.columnCount = 1;
            this.canEdit = this.getAcl().checkScope('CApartment', 'edit');

            this.wait(this.loadAll());
        },

        setupFinal: function () {
            this.setPageTitle(this.translate('Chessboard', 'labels', 'CApartment'));
        },

        afterRender: function () {
            // Меню статуса закрываем по клику мимо него.
            this.$closeHandler = () => this.closeStatusMenu();

            $(document).on('click.apt-board', this.$closeHandler);
        },

        onRemove: function () {
            $(document).off('click.apt-board');
        },

        loadAll: async function () {
            const collection = await this.getCollectionFactory().create('CBuilding');

            collection.maxSize = 200;
            collection.sortBy = 'name';
            collection.order = 'asc';

            await collection.fetch();

            this.buildings = collection.models.map(model => ({
                id: model.id,
                name: model.get('name'),
            }));

            const known = this.buildings.some(item => item.id === this.buildingId);

            if (!known) {
                this.buildingId = this.buildings.length ? this.buildings[0].id : null;
            }

            await this.loadApartments();
        },

        loadApartments: async function () {
            this.apartments = [];

            if (this.buildingId) {
                const collection = await this.getCollectionFactory().create('CApartment');

                collection.maxSize = 1000;
                collection.sortBy = 'floor';
                collection.order = 'desc';
                collection.where = [
                    {
                        type: 'equals',
                        attribute: 'buildingId',
                        value: this.buildingId,
                    },
                ];

                await collection.fetch();

                this.apartments = collection.models.map(model => ({
                    id: model.id,
                    number: model.get('name'),
                    floor: model.get('floor'),
                    position: model.get('position'),
                    rooms: model.get('rooms'),
                    area: model.get('area'),
                    price: model.get('price'),
                    status: model.get('status'),
                }));
            }

            this.buildRows();
        },

        reload: function () {
            this.loadApartments().then(() => this.reRender());
        },

        buildRows: function () {
            const byFloor = {};
            let maxPosition = 1;

            this.apartments.forEach(item => {
                const floor = item.floor || 0;

                byFloor[floor] = byFloor[floor] || {};
                byFloor[floor][item.position || 1] = item;

                maxPosition = Math.max(maxPosition, item.position || 1);
            });

            this.columnCount = maxPosition;

            // Верхние этажи сверху — как в настоящей шахматке.
            const floors = Object.keys(byFloor)
                .map(value => parseInt(value, 10))
                .sort((a, b) => b - a);

            this.rows = floors.map(floor => {
                const cells = [];

                for (let position = 1; position <= maxPosition; position++) {
                    const item = byFloor[floor][position];

                    cells.push(item ? this.prepareCell(item) : {empty: true});
                }

                return {floor: floor, cells: cells};
            });
        },

        prepareCell: function (item) {
            const parts = [];

            if (item.rooms) {
                parts.push(item.rooms + '-к');
            }

            if (item.area) {
                parts.push(this.formatNumber(item.area, 1) + ' м²');
            }

            const statusLabel = this.getLanguage()
                .translateOption(item.status, 'status', 'CApartment');

            return {
                id: item.id,
                number: item.number,
                status: item.status,
                meta: parts.join(' · '),
                price: this.formatPrice(item.price),
                tooltip: 'Кв. ' + item.number + ' · ' + statusLabel +
                    ' · этаж ' + item.floor + '\nКлик — карточка, правый клик — статус',
            };
        },

        formatNumber: function (value, decimals) {
            if (value === null || value === undefined) {
                return '';
            }

            return value.toFixed(decimals).replace('.', ',').replace(/,0$/, '');
        },

        formatPrice: function (value) {
            if (!value) {
                return '—';
            }

            if (value >= 1000000) {
                return this.formatNumber(value / 1000000, 2) + ' млн ₽';
            }

            return Math.round(value / 1000) + ' тыс ₽';
        },

        data: function () {
            return {
                hasBuildings: this.buildings.length > 0,
                hasRows: this.rows.length > 0,
                buildings: this.buildings.map(item => ({
                    id: item.id,
                    name: item.name,
                    selected: item.id === this.buildingId,
                })),
                rows: this.rows,
                columnCount: this.columnCount,
                canEdit: this.canEdit,
                summary: this.buildSummary(),
            };
        },

        buildSummary: function () {
            return STATUS_LIST.map(status => {
                const list = this.apartments.filter(item => item.status === status);
                const sum = list.reduce((acc, item) => acc + (item.price || 0), 0);

                return {
                    key: status,
                    label: this.getLanguage().translateOption(status, 'status', 'CApartment'),
                    count: list.length,
                    sum: list.length ? this.formatPrice(sum) : '',
                };
            });
        },

        openApartment: function (id) {
            this.createView('detail', 'views/modals/detail', {
                scope: 'CApartment',
                id: id,
            }, view => {
                view.render();

                this.listenToOnce(view, 'after:save', () => this.reload());
                this.listenToOnce(view, 'after:destroy', () => this.reload());
            });
        },

        openStatusMenu: function ($cell) {
            const id = $cell.attr('data-id');
            const current = (($cell.attr('class') || '').match(/apt-status-(\w+)/) || [])[1];

            const $menu = this.$el.find('.apt-status-menu');

            const html = STATUS_LIST.map(status => {
                const label = this.getLanguage().translateOption(status, 'status', 'CApartment');
                const check = status === current ? ' <span class="fas fa-check text-muted"></span>' : '';

                return '<li><a role="button" tabindex="0" data-status="' + status + '">' +
                    '<span class="apt-dot apt-dot-' + status + '"></span>' + label + check + '</a></li>';
            }).join('');

            const cellOffset = $cell.offset();
            const pageOffset = this.$el.find('.apt-page').offset();

            $menu
                .html(html)
                .css({
                    display: 'block',
                    top: cellOffset.top - pageOffset.top + $cell.outerHeight() - 2,
                    left: cellOffset.left - pageOffset.left + 4,
                });

            $menu.find('a').off('click').on('click', e => {
                e.stopPropagation();

                this.setStatus(id, $(e.currentTarget).attr('data-status'));
                this.closeStatusMenu();
            });
        },

        closeStatusMenu: function () {
            this.$el.find('.apt-status-menu').css('display', 'none');
        },

        setStatus: function (id, status) {
            const item = this.apartments.find(item => item.id === id);

            if (!item || item.status === status) {
                return;
            }

            const previous = item.status;

            item.status = status;
            this.buildRows();
            this.reRender();

            Espo.Ajax.putRequest('CApartment/' + id, {status: status})
                .then(() => {
                    Espo.Ui.success(this.translate('Saved'));
                })
                .catch(() => {
                    // Сервер не принял — возвращаем клетку в прежний цвет.
                    item.status = previous;
                    this.buildRows();
                    this.reRender();
                });
        },
    });
});
