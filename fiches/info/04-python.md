---
id: info-python
matiere: info
titre: Programmer en Python : les bases
chapitre: Informatique — Programmation
resume: Variables et types, entrées-sorties, conditions, boucles for et while, fonctions, listes, et les erreurs les plus fréquentes.
mots-cles: Python, algorithme, variable, type, int, float, str, bool, input, print, if, elif, else, for, range, while, fonction, def, return, liste, f-string, indentation, erreur
ordre: 4
---

## Variables et types

Une ==variable== est une « boîte » nommée qui contient une valeur.

| Type | Exemple | Description |
|---|---|---|
| `int` | `port = 443` | nombre entier |
| `float` | `tension = 3.3` | nombre à virgule (avec un **point**) |
| `str` | `nom = "switch1"` | chaîne de caractères |
| `bool` | `actif = True` | booléen : `True` ou `False` |
| `list` | `ports = [22, 80, 443]` | liste de valeurs |

Opérations : `+ - * /`, `//` (division entière), `%` (reste), `**` (puissance : `2 ** 8` donne 256).

## Entrées et sorties

```python
nom = input("Ton prénom ? ")          # input renvoie toujours du texte (str)
age = int(input("Ton âge ? "))        # on convertit en entier avec int()
print(f"Bonjour {nom}, tu as {age} ans")   # f-string
```

## Les conditions

```python
temperature = float(input("Température du processeur : "))
if temperature > 90:
    print("Danger : arrêt immédiat")
elif temperature > 75:
    print("Attention : surchauffe")
else:
    print("Température normale")
```

Comparaisons : `==` (égal), `!=` (différent), `<`, `>`, `<=`, `>=`. Opérateurs logiques : `and`, `or`, `not`.

> [!attention] L'indentation est obligatoire
> En Python, ce sont les **espaces en début de ligne** (4 en général) qui délimitent les blocs, après les **deux-points** `:`.

## Les boucles

- La boucle ==for== répète un nombre de fois **connu** : `range(5)` donne 0, 1, 2, 3, 4 ; `range(1, 11)` donne 1 à 10 ; `range(0, 100, 10)` va de 10 en 10.
- La boucle ==while== répète **tant qu'une condition est vraie** (attention à la boucle infinie !).

```python
for i in range(1, 6):
    print(f"Test du port {i}")

essais = 0
code = ""
while code != "1234" and essais < 3:
    code = input("Code PIN : ")
    essais = essais + 1
```

## Les fonctions

Une ==fonction== regroupe des instructions réutilisables ; `return` renvoie le résultat.

```python
def nb_hotes(cidr):
    """Nombre d'hôtes d'un réseau IPv4 /cidr"""
    return 2 ** (32 - cidr) - 2

print(nb_hotes(24))   # 254
print(nb_hotes(27))   # 30
```

## Les listes

```python
ports = [22, 80, 443]
ports.append(3389)          # ajoute à la fin
print(ports[0])             # premier élément : 22 (les indices commencent à 0)
print(len(ports))           # nombre d'éléments : 4
for p in ports:
    print("Port ouvert :", p)
```

## Outils pratiques pour le CIEL

`bin(173)` → `'0b10101101'` · `hex(173)` → `'0xad'` · `int("10101101", 2)` → `173` · `int("ad", 16)` → `173`.

> [!astuce] Les erreurs les plus fréquentes
> - `IndentationError` : mauvais décalage des lignes.
> - `SyntaxError` : oubli des `:` après `if`, `for`, `def`, ou d'une parenthèse.
> - `NameError` : variable mal orthographiée ou pas encore créée.
> - `TypeError` : mélange de texte et de nombre (`"5" + 3`) → convertir avec `int()` ou `str()`.
> - Confondre `=` (affectation) et `==` (comparaison).

> [!retenir]
> `input()` renvoie du texte · `for` = nombre de tours connu · `while` = tant que · `def` + `return` pour une fonction · les indices de liste commencent à **0** · l'indentation définit les blocs.

=== EXERCICES ===
# trous : Complète le programme Python
~~~
nom = [[input]]("Ton prénom ? ")
age = [[int]](input("Ton âge ? "))
if age >= 18:
    print("Majeur")
[[else]]:
    print("Mineur")
for i in [[range]](3):
    print(nom)
~~~

# calcul : Que vaut la variable x ?
? `x = 17 % 5`
= 2
? `x = 7 // 2`
= 3
? `x = 2 ** 5`
= 32
? Combien de fois s'exécute `for i in range(3, 10):` ?
= 7

=== CARTES ===
Q: Quel type renvoie input() ?
R: Toujours une **chaîne de caractères** (str) : il faut convertir avec int() ou float().

Q: Que donne range(5) ?
R: Les nombres **0, 1, 2, 3, 4** (5 non compris).

Q: Différence entre for et while ?
R: **for** : nombre de répétitions connu ; **while** : répète **tant qu'une condition** est vraie.

Q: Différence entre = et == ?
R: **=** affecte une valeur à une variable ; **==** compare deux valeurs.

Q: Que fait return dans une fonction ?
R: Il **renvoie le résultat** de la fonction (et la termine).

Q: Indice du premier élément d'une liste ?
R: **0**

Q: Comment ajouter un élément à la fin d'une liste ?
R: Avec **append()** : ports.append(8080)

Q: Que vaut 17 % 5 ?
R: **2** (le reste de la division euclidienne).

Q: Que vaut 2 ** 10 ?
R: **1024**

Q: Comment convertir "1010" (binaire) en entier ?
R: **int("1010", 2)** → 10

=== QUIZ ===
? Que affiche `print(7 // 2)` ?
- 3.5
+ 3
- 1
! // est la division entière.

? Combien de fois s'exécute `for i in range(2, 8):` ?
- 8
+ 6
- 7
! i prend les valeurs 2, 3, 4, 5, 6, 7 : 6 tours.

? `age = input("Âge ? ")` puis `age + 1` provoque…
+ une TypeError, car age est une chaîne
- l'âge plus un
- une IndentationError
! input renvoie du texte : il faut écrire int(input(...)).

? Que contient la liste après `l = [1, 2]` puis `l.append(5)` ?
- [5, 1, 2]
+ [1, 2, 5]
- [1, 2]
! append ajoute à la fin.

? Quel mot-clé définit une fonction ?
- function
+ def
- func
! def nom_de_fonction(paramètres):

? Que renvoie `hex(255)` ?
+ '0xff'
- '11111111'
- '255'
! hex() donne l'écriture hexadécimale ; bin(255) donnerait '0b11111111'.
