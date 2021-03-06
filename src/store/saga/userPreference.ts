import browserService from '../../common/browser';
import storage from '../../common/storage';
import { AnyAction, isType } from 'typescript-fsa';
import {
  asyncAddAccount,
  asyncDeleteAccount,
  asyncHideTool,
  asyncRemoveTool,
  asyncSetEditorLiveRendering,
  asyncSetShowLineNumber,
  asyncSetShowQuickResponseCode,
  asyncUpdateCurrentAccountIndex,
  asyncVerificationAccessToken,
  asyncSetDefaultPluginId,
  asyncRunExtension,
  asyncRunScript,
} from './../actions';
import { call, fork, put, select, takeEvery } from 'redux-saga/effects';
import backend, { documentServiceFactory } from '../../common/backend';
import { message } from 'antd';
import { ToolContext } from '../../extensions/interface';
import { loadImage } from '../../common/blob';
const md5 = require('blueimp-md5');

export function* asyncVerificationAccessTokenSaga(action: AnyAction) {
  if (isType(action, asyncVerificationAccessToken.started)) {
    try {
      const { type, info } = action.payload;
      const service = documentServiceFactory(type, info);
      const userInfo = yield call(service.getUserInfo);
      const repositories = yield call(service.getRepositories);
      yield put(
        asyncVerificationAccessToken.done({
          params: action.payload,
          result: {
            repositories,
            userInfo,
          },
        })
      );
    } catch (error) {
      console.log(error);
      message.error('AccessToken 错误');
      yield put(
        asyncVerificationAccessToken.failed({
          params: action.payload,
          error: {
            error: error,
          },
        })
      );
    }
  }
}

export function* watchAsyncVerificationAccessTokenSaga() {
  yield takeEvery(
    asyncVerificationAccessToken.started.type,
    asyncVerificationAccessTokenSaga
  );
}

export function* asyncAddAccountSaga() {
  const selector = ({
    userPreference: {
      initializeForm: { type, userInfo, defaultRepositoryId, info },
    },
  }: GlobalStore) => {
    return {
      type,
      userInfo,
      defaultRepositoryId,
      info,
    };
  };
  const selectState: ReturnType<typeof selector> = yield select(selector);
  let { type, defaultRepositoryId, userInfo, info } = selectState;
  const account: AccountPreference = {
    id: md5(JSON.stringify({ info, type })),
    type: type,
    ...info,
    defaultRepositoryId: defaultRepositoryId,
    ...userInfo,
  };
  try {
    yield call(storage.addAccount, account);
  } catch (error) {
    if (error.message === 'Do not allow duplicate accounts') {
      message.error('不允许添加重复账户');
      return;
    } else {
      message.error('添加账户失败 未知错误');
      return;
    }
  }
  const accounts = yield call(storage.getAccounts);
  const defaultAccountId = yield call(storage.getDefaultAccountId);

  yield put(
    asyncAddAccount.done({
      result: { accounts, defaultAccountId },
    })
  );
}

export function* watchAsyncAddAccountSaga() {
  yield takeEvery(asyncAddAccount.started.type, asyncAddAccountSaga);
}

export function* asyncDeleteAccountSaga(action: AnyAction) {
  if (isType(action, asyncDeleteAccount.started)) {
    yield call(storage.deleteAccountById, action.payload.id);
    const accounts = yield call(storage.getAccounts);
    const defaultAccountId = yield call(storage.getDefaultAccountId);
    yield put(
      asyncDeleteAccount.done({
        params: action.payload,
        result: {
          accounts: accounts,
          defaultAccountId: defaultAccountId,
        },
      })
    );
  }
}

export function* watchAsyncDeleteAccountSaga() {
  yield takeEvery(asyncDeleteAccount.started.type, asyncDeleteAccountSaga);
}

export function* asyncUpdateCurrentAccountIndexSaga(action: AnyAction) {
  if (isType(action, asyncUpdateCurrentAccountIndex.started)) {
    yield call(storage.setDefaultAccountId, action.payload.id);
    yield put(
      asyncUpdateCurrentAccountIndex.done({
        params: action.payload,
        result: action.payload,
      })
    );
  }
}

export function* watchAsyncUpdateCurrentAccountIndexSaga() {
  yield takeEvery(
    asyncUpdateCurrentAccountIndex.started.type,
    asyncUpdateCurrentAccountIndexSaga
  );
}

export function* asyncSetShowLineNumberSaga(action: AnyAction) {
  if (isType(action, asyncSetShowLineNumber.started)) {
    const value = action.payload.value;
    yield call(storage.setShowLineNumber, !value);
    yield put(
      asyncSetShowLineNumber.done({
        params: {
          value,
        },
        result: {
          value: !value,
        },
      })
    );
  }
}

export function* watchAsyncSetShowLineNumberSaga() {
  yield takeEvery(
    asyncSetShowLineNumber.started.type,
    asyncSetShowLineNumberSaga
  );
}

export function* asyncSetEditorLiveRenderingSaga(action: AnyAction) {
  if (isType(action, asyncSetEditorLiveRendering.started)) {
    const value = action.payload.value;
    yield call(storage.setLiveRendering, !value);
    yield put(
      asyncSetEditorLiveRendering.done({
        params: {
          value,
        },
        result: {
          value: !value,
        },
      })
    );
  }
}

export function* asyncSetShowQuickResponseCodeSaga(action: AnyAction) {
  if (isType(action, asyncSetShowQuickResponseCode.started)) {
    const value = action.payload.value;
    yield call(storage.setShowQuickResponseCode, !value);
    yield put(
      asyncSetShowQuickResponseCode.done({
        params: {
          value,
        },
        result: {
          value: !value,
        },
      })
    );
  }
}

export function* watchAsyncSetShowQuickResponseCodeSaga() {
  yield takeEvery(
    asyncSetShowQuickResponseCode.started.type,
    asyncSetShowQuickResponseCodeSaga
  );
}

export function* watchAsyncSetEditorLiveRenderingSaga() {
  yield takeEvery(
    asyncSetEditorLiveRendering.started.type,
    asyncSetEditorLiveRenderingSaga
  );
}

export function* asyncHideToolSaga(action: AnyAction) {
  if (isType(action, asyncHideTool.started)) {
    yield call(browserService.sendActionToCurrentTab, action);
  }
}

export function* watchAsyncHideToolSaga() {
  yield takeEvery(asyncHideTool.started.type, asyncHideToolSaga);
}

export function* asyncRemoveToolSaga(action: AnyAction) {
  if (isType(action, asyncRemoveTool.started)) {
    yield call(browserService.sendActionToCurrentTab, action);
  }
}

export function* watchAsyncRemoveToolSaga() {
  yield takeEvery(asyncRemoveTool.started.type, asyncRemoveToolSaga);
}

export function* asyncSetDefaultPluginIdSaga(action: AnyAction) {
  if (isType(action, asyncSetDefaultPluginId.started)) {
    yield call(storage.setDefaultPluginId, action.payload.pluginId);
    yield put(
      asyncSetDefaultPluginId.done({
        params: action.payload,
      })
    );
  }
}

export function* watchAsyncSetDefaultPluginIdSaga() {
  yield takeEvery(
    asyncSetDefaultPluginId.started.type,
    asyncSetDefaultPluginIdSaga
  );
}

export function* asyncRunExtensionSaga(action: AnyAction) {
  if (isType(action, asyncRunExtension.started)) {
    const { extension } = action.payload;
    let result;
    const { run, afterRun, destroy } = extension;
    if (run) {
      result = yield call(
        browserService.sendActionToCurrentTab,
        asyncRunScript.started(run)
      );
    }
    const selector = (state: GlobalStore) => {
      const pathname = state.router.location.pathname;
      const data = state.clipper.clipperData[pathname];
      return {
        data,
        pathname,
      };
    };
    const { data, pathname }: ReturnType<typeof selector> = yield select(
      selector
    );
    if (afterRun) {
      result = yield (async () => {
        //@ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const context: ToolContext = {
          result,
          data,
          message,
          imageService: backend.getImageHostingService(),
          loadImage: loadImage,
          captureVisibleTab: browserService.captureVisibleTab,
        };
        // eslint-disable-next-line
        return await eval(afterRun);
      })();
    }
    if (destroy) {
      yield call(
        browserService.sendActionToCurrentTab,
        asyncRunScript.started(destroy)
      );
    }
    yield put(
      asyncRunExtension.done({
        params: action.payload,
        result: {
          result,
          pathname,
        },
      })
    );
  }
}

export function* watchAsyncRunExtensionSaga() {
  yield takeEvery(asyncRunExtension.started.type, asyncRunExtensionSaga);
}

export function* userPreferenceSagas() {
  yield fork(watchAsyncDeleteAccountSaga);
  yield fork(watchAsyncVerificationAccessTokenSaga);
  yield fork(watchAsyncAddAccountSaga);
  yield fork(watchAsyncUpdateCurrentAccountIndexSaga);
  yield fork(watchAsyncSetEditorLiveRenderingSaga);
  yield fork(watchAsyncSetShowLineNumberSaga);
  yield fork(watchAsyncHideToolSaga);
  yield fork(watchAsyncRemoveToolSaga);
  yield fork(watchAsyncSetShowQuickResponseCodeSaga);
  yield fork(watchAsyncSetDefaultPluginIdSaga);
  yield fork(watchAsyncRunExtensionSaga);
}
