import { initFederation, processRemoteInfo, processRemoteInfos } from '@angular-architects/native-federation';
import { environment } from './environments/environment';

initFederation()
  .then(() =>
    Promise.all(Object.entries(environment.mfe).map(([key, path]) =>
      processRemoteInfo(path + '/remoteEntry.json', key)
        .then(console.log)
        .catch((e)=> {
        console.warn(e)
        return null
      })
    ))
  )
  .then(_ => import('./bootstrap'))
  .catch(err => console.error(err));
