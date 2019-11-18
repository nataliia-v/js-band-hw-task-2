function getTruckIdsCallback(callback) {
  setTimeout(() => {
    callback([1,2,5,9,67]);
  }, 1000)
}

function getTruckIds() {
  return new Promise((resolve => {
    getTruckIdsCallback(result => resolve(result));
  }));
}

function getTruckByIdCallback(id, callback) {
  setTimeout(() => {
    const isError = Math.ceil(Math.random()*1000) < 900;
    if (isError) {
      return callback(undefined, "Internal error");
    }
    callback({
      id: id,
      model: `truck ${id}`
    });
  })
}

function getTruckById(id) {
  //Please implemented this method use getTruckByIdCallback
  return new Promise((resolve, reject) => {
    getTruckByIdCallback(id, (result, error) => {
      if (error) reject(error);

      else resolve(result);
    });
  });
}

// We want to implement a new method for retrieving information about trucks:
const retryCallback = (attempts = 2, callback, callbackParam, onSuccess) => {
  let errorCount = 0;

  const onError = param => {
    if (errorCount >= attempts) {
      return;
    }
    errorCount = errorCount + 1;

    // console.log('error id', param, 'errorCount', errorCount);

    callback(param, (result, error) => {
      if (result) {
        onSuccess(result);
      } else if (error) {
        onError(param);
      }
    })
  };

  callback(callbackParam, (result, error) => {
    if (result) {
      onSuccess(result);
    } else if (error) {
      onError(callbackParam);
    }
  })

};


// We want to implement a new method for retrieving information about trucks:
// callback(list, err)
// list - list of trucks

// callback
function getTruckListCallback(callback) {
  const allTrucks = [];

  const onSuccess = truck => {
    allTrucks.push(truck);
  };

  getTruckIdsCallback((allIds) => {
    allIds.forEach(id => {
      retryCallback(2, getTruckByIdCallback, id, onSuccess);
    });

    callback(allTrucks);
  });
}

async function retry(
  asyncFunc,
  asyncFuncParam,
  retriesLeft = 2,
) {
  try {
    return await asyncFunc(asyncFuncParam);
  } catch (error) {
    if (retriesLeft) {
      return retry(asyncFunc, asyncFuncParam,retriesLeft - 1);
    }

    return;
  }
}

// promise
function getTruckListPromise() {

  return new Promise(((resolve, reject) => {
    getTruckIds()
      .then(ids => {
        return Promise.all(ids.map(id => retry(getTruckById, id)));
      })
      .then(trucks => {
        const result = trucks.filter(truck => !!truck);
        if (!result.length) {
          reject('No Trucks');
        }
        resolve(result)
      })
  }))
}

getTruckListPromise()
  .then(list => console.log(list))
  .catch(err => console.log(err));

// async/await
async function getTruckListAsyncAwait() {

  const ids = await getTruckIds();

  const allTrucks = await Promise.all(ids.map(id => retry(getTruckById, id)));

  const result = allTrucks.filter(truck => !!truck);

  if (!result.length) throw new Error('No Trucks');

  return result;
}

const logAsyncAwaitTrucks = async () => {
  try {
    const allTrucks = await getTruckListAsyncAwait();
    console.log('getTruckListAsyncAwait', allTrucks);
  } catch(error) {
    console.log('getTruckListAsyncAwait error', error);
  }
};

logAsyncAwaitTrucks();
