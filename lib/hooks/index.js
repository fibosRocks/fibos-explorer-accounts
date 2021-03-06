module.exports = {
    "eosio/newaccount": (db, messages) => {
        messages.forEach(msg => {
            let data = msg.act.data;

            let name = data.name;
            let owner = data.owner;
            let active = data.active;
            let creator = data.creator;

            let FibosAccounts = db.models.fibos_accounts;

            if (FibosAccounts.oneSync({ id: name })) return;

            FibosAccounts.createSync({
                id: name,
                creator_id: creator,
                created: msg.block_time
            })

            let FibosPermissions = db.models.fibos_permissions;

            owner.keys.forEach((k) => {
                FibosPermissions.createSync({
                    account_id: name,
                    pub_key: k.key,
                    permission: "owner"
                })
            })

            active.keys.forEach((k) => {
                FibosPermissions.createSync({
                    account_id: name,
                    pub_key: k.key,
                    permission: "active"
                })
            })
        })
    },
    "eosio/updateauth": (db, messages) => {
        messages.forEach(msg => {
            let data = msg.act.data;
            let name = data.account;
            let permission = data.permission;
            let keys = data.auth.keys;

            let account = db.models.fibos_accounts.oneSync({ id: name });
            if (!account) return;

            let FibosPermissions = db.models.fibos_permissions;

            FibosPermissions.deletePermission(name, permission);
            keys.forEach(k => {
                FibosPermissions.createSync({
                    pub_key: k.key,
                    account_id: name,
                    permission: permission
                })
            });
        })
    },
    "eosio/deleteauth": (db, messages) => {
        messages.forEach(msg => {
            let data = msg.act.data;

            let account = db.models.fibos_accounts.oneSync({ id: data.account });
            if (!account) return;
            db.models.fibos_permissions.deletePermission(data.account, data.permission);
        })
    }
}