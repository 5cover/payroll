<?php
require_once 'Page.php';

$page = new Page('Production', ['production/index.css'], ['production/index.js']);
$page->put(function () {
    ?>
    <table>
        <caption><strong class="c">Suivi de production</strong></caption>
        <thead>
            <tr>
                <th><label for="date">Date:</label></th>
                <td colspan="5"><input type="date" <?= nameid('date') ?>></td>
                <th><label for="equipe">Équipe:</label></th>
                <td colspan="3"><input type="text" <?= nameid('equipe') ?>></td>
                <th><label for="nb-employes">Nombre d'employés:</label></th>
                <td><input type="number" <?= nameid('nb-employes') ?> min="0"></td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th colspan="2"><label for="numero-machine">Numéro de machine:</label></th>
                <td><select <?= nameid('numero-machine') ?>>
                        <?php for ($i = 1; $i <= 41; ++$i) { ?>
                            <option value="<?= $i ?>"><?= $i ?></option><?php } ?>
                    </select></td>
                <td></td>
                <th><label for="pp-homo">PP HOMO:</label></th>
                <td><select <?= nameid('pp-homo') ?>></select></td>
                <td><?php put_pct_input('pp-homo-pct') ?></td>
                <th><label for="resine-granulee">Résine granulée:</label></th>
                <td><input type="text" <?= nameid('resine-granulee') ?>></td>
                <td><?php put_pct_input('resine-granulee-pct') ?></td>
                <td colspan="2"></td>
            </tr>
            <tr>
                <th colspan="2">Nom du produit:</th>
                <td id="nom-produit"></td>
                <td></td>
                <th><label for="pp-copo">PP COPO:</label></th>
                <td><select <?= nameid('pp-copo') ?>></select></td>
                <td><?php put_pct_input('pp-copo-pct') ?></td>
                <th><label for="caco3">CaCO3:</label></th>
                <td><input type="text" <?= nameid('caco3') ?>></td>
                <td><?php put_pct_input('caco3-pct') ?></td>
                <td colspan="2"></td>
            </tr>
            <tr>
                <th colspan="2"><label for="numero-moule">Numéro de moule:</label></th>
                <td><input type="text" <?= nameid('numero-moule') ?>></td>
                <td></td>
                <th><label for="pp-random">PP RANDOM:</label></th>
                <td><select <?= nameid('pp-random') ?>></select></td>
                <td><?php put_pct_input('pp-random-pct') ?></td>
                <th><label for="gfrp">GFRP:</label></th>
                <td><input type="text" <?= nameid('gfrp') ?>></td>
                <td><?php put_pct_input('gfrp-pct') ?></td>
                <td colspan="2"></td>
            </tr>
            <tr>
                <th colspan="2"><label for="couleurs">Couleurs:</label></th>
                <td><select <?= nameid('couleurs') ?>></select></td>
                <td></td>
                <th><label for="abs">ABS:</label></th>
                <td><select <?= nameid('abs') ?>></select></td>
                <td><?php put_pct_input('abc-pct') ?></td>
                <td colspan="5"></td>
            </tr>
            <tr>
                <th colspan="2"><label for="dosage-masterbatch-pct">Dosage de masterbatch:</label></th>
                <td><?php put_pct_input('dosage-masterbatch-pct', 1.2, 0.01) ?></td>
                <td id="dosage-masterbatch-pct-times-poids-produit-total"></td>
                <th><label for="miseflex">MISEFLEX:</label></th>
                <td><select <?= nameid('miseflex') ?>></select></td>
                <td><?php put_pct_input('miseflex-pct') ?></td>
                <td colspan="5"></td>
            </tr>
            <tr>
                <th colspan="2"><label for="date-debut-lot">Lot de production:</label></th>
                <td><input type="date" <?= nameid('date-debut-lot') ?>></td>
                <td><input type="date" <?= nameid('date-fin-lot') ?>></td>
                <th><label for="date-fin-lot">Durée de production:</label></th>
                <td colspan="2" id="duree-lot"></td>
                <td colspan="5"></td>
            </tr>
        </tbody>
        <tbody>
            <tr>
                <th class="c">Temps</th>
                <th class="c">Production</th>
                <th class="c">Bon produits</th>
                <th class="c">Produits défectueux</th>
                <th class="c">Poids du produit (KGS)</th>
                <th class="c">Poids du carrot (KGS)</th>
                <th class="c">Cadence(s)</th>
                <th class="c">Nombre de cavités du module</th>
                <th class="c">Temps de la défaillance (min)</th>
                <th class="c">Production totale</th>
                <th class="c">Matricule</th>
                <th class="c">Remarques</th>
            </tr>
            <?php for ($i = 0; $i < 24; $i += 2) {
                $h = ($i + 6) % 24 ?>
            <tr>
                <th class="c"><?= $h ?>:00-<?= $h + 2 ?>:00</th>
                <?php put_tds($h) ?>
            </tr>
            <?php } ?>
        </tbody>
        <tfoot>
            <tr>
                <th class="c"><strong>Total:</strong></th>
                <?php put_tds('total') ?>
            </tr>
            <tr>
                <th colspan="7">Signature du responsable:</th>
                <th colspan="5">Date:</th>
            </tr>
        </tfoot>
    </table>
    <?php
});

function put_tds(string $suffix)
{
?>
<td><input type="number" <?= nameid("production-$suffix") ?> min="0"></td>
<td><input type="number" <?= nameid("bon-$suffix") ?> min="0"></td>
<td><input type="number" <?= nameid("mauvais-$suffix") ?> min="0"></td>
<td><input type="number" <?= nameid("poids-produit-$suffix") ?> min="0" step="0.001"></td>
<td><input type="number" <?= nameid("poids-carrot-$suffix") ?> min="0" step="0.001"></td>
<td><input type="number" <?= nameid("cadences-$suffix") ?> min="0" step="0.1"></td>
<td><input type="number" <?= nameid("nb-cavites-$suffix") ?> min="0"></td>
<td><input type="number" <?= nameid("temps-defaillance-$suffix") ?> min="0" max="120"></td>
<td><input type="number" <?= nameid("production-totale-$suffix") ?> min="0"></td>
<td><input type="text" <?= nameid("matricule-$suffix") ?>></td>
<td><input type="text" <?= nameid("remarques-$suffix") ?>></td>
<?php
}

function put_pct_input(string $nameid, float $value = 50, ?float $step = null)
{
?>
<div class="sep"><input type="number" <?= nameid($nameid) ?> min="0" max="100" value="<?= $value ?>"<?= $step === null ? '' : " step=\"$step\"" ?>>&nbsp;%</div>
<?php
}

function nameid(string $nameid)
{
    $nameid = h14s($nameid);
    echo "name=\"$nameid\" id=\"$nameid\"";
}
