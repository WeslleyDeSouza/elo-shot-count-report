import { environment } from "../environments/environment";

export const mfeConfig = {
  auth:{
    env:environment,
    hooks: {
      onLogin: 'api/auth/me/session'
    },
    mock: {
      defaultUser: environment?.sampleUser
    },
    endpoints:{
      signOut:'auth/signout', // todo allow with api/auth/signout
    },
    tenant:{
      enabled: true,
      effects: true
    },
    effects: true
  },
  layout:{
    env:environment,
    effects:true
  },
  admin:{
    env:environment,
    pages:{
      userOverview:{
        inline:true,
        tableColumns:[
          { key: 'firstName' },
          { key: 'lastName' },
          { key: 'email' },
          { key: 'phone' },
          //
          { key: 'roles', type: 'tags' },
          { key: 'loginLast', type: 'dateTime' },
          { key: 'createdAt', type: 'dateTime' },
        ],
        fields: ['userId', 'firstName', 'lastName', 'email', 'phone', 'loginInfo', 'loginLast','createdAt'],
        editable: true
      },
      tenantOverview:{
        inline:true,
        editable: true,
        login: true,
        tableColumns:[
          { key: 'tenantName' },
          { key: 'workspaceName' },
          { key: 'actionLogin', type: 'button' },
        ],
        fields: ['tenantId', 'tenantName', 'workspaceName', 'workspaceLocationCode', 'userCount'],
      },
      tenantForm:{
        inline:true
      },
      // Form
      userForm:{
        inline:true,
        showSettingsResetPassword:true,
        userCreateAutoAddToTenant: 'admin/tenant/assignUser/:userId/:userAuthYear',
      }
    }
  },
  setting:{
    env:environment,
    effects:true
  },
  templateBuilder:{
    env:environment,
    effects:true,
    pages:{

    }
  }
}
