<?php
/**
 * Тестовые данные для шахматки: один корпус и сетка квартир.
 *
 * Запуск:  docker exec -u www-data espocrm php /var/www/html/seed.php
 * Повторный запуск ничего не дублирует: корпус ищется по названию,
 * существующие квартиры пропускаются.
 */

include '/var/www/html/bootstrap.php';

$app = new Espo\Core\Application();
$app->setupSystemUser();

$em = $app->getContainer()->getByClass(Espo\ORM\EntityManager::class);

$buildingName = 'Корпус 1';
$floors = 9;
$lines = 4;

$building = $em->getRDBRepository('CBuilding')
    ->where(['name' => $buildingName])
    ->findOne();

if (!$building) {
    $building = $em->createEntity('CBuilding', [
        'name' => $buildingName,
        'address' => 'Москва, ул. Примерная, 10',
        'floorCount' => $floors,
        'lineCount' => $lines,
    ]);
    echo "Создан корпус: {$buildingName}\n";
}

$areaByRooms = [1 => 38.5, 2 => 54.0, 3 => 76.2, 4 => 95.0];
$pricePerMeter = 285000;
$created = 0;

for ($floor = 1; $floor <= $floors; $floor++) {
    for ($position = 1; $position <= $lines; $position++) {
        $number = (string) (($floor - 1) * $lines + $position);

        $exists = $em->getRDBRepository('CApartment')
            ->where([
                'buildingId' => $building->getId(),
                'floor' => $floor,
                'position' => $position,
            ])
            ->findOne();

        if ($exists) {
            continue;
        }

        $rooms = [1, 2, 3, 2][$position - 1];
        $area = $areaByRooms[$rooms];

        // Этажи выше ценятся дороже: плюс 0,5% за этаж.
        $price = round($area * $pricePerMeter * (1 + 0.005 * ($floor - 1)), -3);

        // Немного разных статусов, чтобы шахматка не была одноцветной.
        $status = 'Free';
        if ($floor <= 2) {
            $status = 'Sold';
        } elseif ($floor === 3 || ($floor === 4 && $position <= 2)) {
            $status = 'Booked';
        }

        $em->createEntity('CApartment', [
            'name' => $number,
            'buildingId' => $building->getId(),
            'floor' => $floor,
            'position' => $position,
            'rooms' => $rooms,
            'area' => $area,
            'price' => $price,
            'priceCurrency' => 'RUB',
            'status' => $status,
        ]);

        $created++;
    }
}

echo "Создано квартир: {$created}\n";
