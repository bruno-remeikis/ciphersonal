# Ciphersonal

## Setting the project up

### Environment variables

In the `.env` file, located in the project root, add the environment variables, as in the example below.
```env
DATABASE_URL=mongodb+srv://<db_user>:<db_password>@cluster0.25vun5n.mongodb.net/?appName=Cluster0
```

## For developers

### Duplicate database

Execute the file `.\scripts\db\duplicate.ps1`.

Or, if you need to execute manually, follow the instruction below.

1. Export origin database
```sh
mongodump \
  --uri="mongodb+srv://usuario:senha@cluster.mongodb.net/banco" \
  --out=./diretorio
```

2. Restore database
```sh
mongorestore \
  --uri="mongodb+srv://usuario:senha@cluster.mongodb.net" \
  --nsFrom="banco_origem.*" \
  --nsTo="banco_destino.*" \
  ./diretorio
```