# Suivi de production

transformation de la fiche de suivi de production

## inputs

Date : choix : date picker

Équipe : choix : text

Nb employés : choix : number input min 0

Numéro de machine : choix : 1-41 drop down

Nom du produit : donné par le numéro de moule

Numéro de moule : text avec auto-complétion (base sur la hashmap numéro moule -> nom produit)

Couleurs : choix : drop down options

Dosage de masterbatch : choix : pourcentage p, calculé : p * total proids porduit

lot de production : choix : date début, choix : date fin

PP HOME : choix : option texte, choix : pourcentage
PP COPO : choix : option texte, choix : pourcentage
PP RANDOM : choix : option texte, choix : pourcentage
ABS : choix : option texte, choix : pourcentage
MISEFLEX : choix : option texte, choix : pourcentage

Durée de production : différence entre début et fin du lot de production (nb jours)

Résite granulée : choix : option (actuellement texte), choix : pourcentage

CaCO3 : choix : option (actuellement texte), choix : pourcentage

GFRP : choix : option (actuellement texte), choix : pourcentage

## tableau de résultats

Temps

choix: production (qté),

choix: produits déféctueux

choix: poids du produit (kgs)

- bg vert (<=1% de différence avec l'expected (en attente))
- bg rouge (>1% de différence avec l'expected (en attente))
- no bg

choix : poids du carrot (kgs) (max 3 décimales)

choix : cadance(s)

choix : nombre de cavités du moule

choix : temps de la défaillance

- STOP : 120min
- < 120min : nombre de minutes

choix : production totale : number

## total

production : somme

bon produits : somme

défectueux : somme

poids produit : voir feuille

## footer

signature du responsable

date
