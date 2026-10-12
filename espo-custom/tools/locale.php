<?php
/**
 * Русская локаль и рублёвый формат чисел.
 *
 * Настройки EspoCRM живут в data/config.php внутри тома Docker, то есть вне
 * git. Этот скрипт приводит их к нужному виду заново — пригодится при
 * переносе на другую машину или после пересоздания тома.
 *
 * Запуск:  docker exec -u www-data espocrm php /var/www/html/locale.php
 */

$file = '/var/www/html/data/config.php';

$config = include $file;

$config['language'] = 'ru_RU';
$config['timeZone'] = 'Europe/Moscow';
$config['dateFormat'] = 'DD.MM.YYYY';
$config['timeFormat'] = 'HH:mm';
$config['weekStart'] = 1;

$config['currencyList'] = ['RUB'];
$config['defaultCurrency'] = 'RUB';
$config['baseCurrency'] = 'RUB';

// 3 — символ валюты после суммы: 16 006 000 ₽. Формат 2 ставит его перед.
$config['currencyFormat'] = 3;
$config['currencyDecimalPlaces'] = 0;

$config['thousandSeparator'] = ' ';
$config['decimalMark'] = ',';

file_put_contents($file, "<?php\nreturn " . var_export($config, true) . ";\n");

echo "Настройки записаны. Дальше нужен bin/command clear-cache.\n";
