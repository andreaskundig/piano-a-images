# Le piano à images

Le piano à images affiche une image pour chaque note jouée par un piano. 

Le plus simple est d'utiliser la [version web](https://rawcdn.githack.com/andreaskundig/piano-a-images/05a9fd5/index.html).
Si on a le projet en local, on peut simplement ouvrir  [index.html](file://index.html) dans un navigateur. 

## Clavier midi
Il devrait être possible d'utiliser un clavier midi branché par usb à son ordinateur. 

Comme je ne dispose pas de clavier midi, la partie midi n'a plus été testée depuis 2017 quand ce projet a été écrit lors d'une résidence de l'oubamupo (= oubapo + oumupo) au château de Bosmelet.

Si le navigateur ne reçoit pas les messages midi, on peut essayer de passer par le serveur websocket. Après avoir installé les librairies:

    npm install

On démarre le serveur ainsi:

    node midi-socket-server.js


![](oubamupo.jpg)
