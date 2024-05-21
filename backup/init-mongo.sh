# #!/bin/bash
# set -e

# # Define the backup directory
# BACKUP_DIR="/backup"

# # Check if the backup directory exists and is not empty
# if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR)" ]; then
#   echo "Backup directory exists and is not empty. Restoring data..."
#   mongorestore --uri="mongodb://localhost:27017" $BACKUP_DIR
# else
#   echo "No backup found or backup directory is empty. Skipping restore."
# fi

# # Start MongoDB
# exec "$@"