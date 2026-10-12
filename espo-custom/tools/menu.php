<?php
/**
 * Добавляет в меню CRM группу «Недвижимость»: шахматку, квартиры и корпуса.
 *
 * Список вкладок — настройка EspoCRM, она живёт в data/config.php внутри тома
 * Docker, то есть вне git. Этот скрипт воспроизводит её на новой установке.
 *
 * Запуск:  docker exec -u www-data espocrm php /var/www/html/menu.php
 *
 * Повторный запуск безопасен: если шахматка уже в меню, скрипт ничего не трогает.
 */

$file = '/var/www/html/data/config.php';

$config = include $file;

$tabs = $config['tabList'] ?? [];

foreach ($tabs as $tab) {
    if (is_array($tab) && ($tab['url'] ?? null) === '#CApartment/chessboard') {
        echo "Раздел уже в меню, ничего не меняю.\n";
        exit;
    }
}

$new = [
    [
        'type' => 'divider',
        'id' => 'realty01',
        'text' => 'Недвижимость',
    ],
    [
        'type' => 'url',
        'id' => 'realty02',
        'text' => 'Шахматка',
        'url' => '#CApartment/chessboard',
        'iconClass' => 'fas fa-th',
        'aclScope' => 'CApartment',
        'onlyAdmin' => false,
        'openInNewTab' => false,
    ],
    'CApartment',
    'CBuilding',
];

$config['tabList'] = array_merge($new, $tabs);

file_put_contents($file, "<?php\nreturn " . var_export($config, true) . ";\n");

echo "Раздел добавлен в меню. Дальше нужен bin/command clear-cache.\n";
