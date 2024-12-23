<?php
    $json = stream_get_contents(STDIN);
    $data = json_decode($json);
?>

<html>
<head>
    <title>Work Times</title>
    <style>
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
        }
    </style>
</head>
<body>
<?php foreach ($data as $d) { ?>
    <h2>Key</h2>
    <table>
        <tr>
            <th>Department</th>
            <th>Name</th>
            <th>No</th>
            <th>ID Number C</th>
            <th>ID Number N</th>
        </tr>
        <tr>
            <td><?= $d->key->department ?></td>
            <td><?= $d->key->name ?></td>
            <td><?= $d->key->no ?></td>
            <td><?= $d->key->id_number_c ?></td>
            <td><?= $d->key->id_number_n ?></td>
        </tr>
    </table>

    <h2>Work Times</h2>
    <table>
        <tr>
            <th>Date</th>
            <th>Work Time</th>
        </tr>
        <?php foreach ($d->work_times as $date => $work_time) { ?>
            <tr>
                <td><?= $date ?></td>
                <td><?= $work_time ?></td>
            </tr>
        <?php } ?>
    </table>
<?php } ?>
</body>
</html>