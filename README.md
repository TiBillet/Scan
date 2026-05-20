# Scan
L'appli mobile de scan de billet, de gestion d'évènement et d'adhésion pour TiBillet




## Installation 




## Développement 
Pour compiler l'application, il faut avoir installé docker.

Lancer le container : `docker compose up`

Rentrer dans le container `docker exec -ti cordova bash`

Pour clean le projet avant de le recompiler : `./reset_projet` (une fois dans le container)

Pour build le projet : `./buildAndroid` -> Créer un fichier apk

Pour lancer le projet sur un téléphone connecté (avec le débogage USB activé !) : `./runAndroid` -> Install l'appli sur le téléphone et la lance