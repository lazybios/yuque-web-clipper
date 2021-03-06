interface GlobalStore {
  clipper: ClipperStore;
  userPreference: UserPreferenceStore;
  router: {
    location: {
      pathname: string;
      search: string;
    };
  };
}

interface Repository {
  id: string;
  name: string;
  private: boolean;
  createdAt: string;
  owner: string;
  /**
   * namespace = owner/name
   */
  namespace: string;
}

interface ImageClipperData {
  dataUrl: string;
  width: number;
  height: number;
}

type ClipperDataType = string | ImageClipperData;

interface ClipperStore {
  /** 网页标题 */
  title?: string;
  /** 网页链接 */
  url?: string;
  /** 当前选择账户的ID */
  currentAccountId: string;
  /** 是否在加载知识库列表 */
  loadingRepositories: boolean;
  /** 知识库列表 */
  repositories: Repository[];
  /** 当前选择的知识库 */
  currentRepository?: Repository;
  clipperData: {
    [key: string]: ClipperDataType;
  };
  /** 是否正在创建文档 */
  creatingDocument: boolean;
  completeStatus?: CompleteStatus;
}

interface CompleteStatus {
  /** 裁剪成功后的文章地址 */
  documentHref: string;
  documentId: string;
  repositoryId: string;
}
interface UserPreferenceStore {
  accounts: AccountPreference[];
  defaultPluginId?: string | null;
  defaultAccountId?: string;
  showQuickResponseCode: boolean;
  showLineNumber: boolean;
  liveRendering: boolean;
  initializeForm: InitializeForm;
  servicesMeta: {
    [type: string]: {
      name: string;
      icon: string;
      homePage: string;
    };
  };
  extensions: any[];
}

interface FormProps {
  value: string;
}
interface InitializeForm {
  type: string;
  info?: any;
  repositories: Repository[];
  defaultRepositoryId?: string;
  visible: boolean;
  verifying: boolean;
  verified: boolean;
  userInfo?: any;
}

interface AccountPreference {
  type: string;
  id: string;
  defaultRepositoryId?: string;
  name: string;
  avatar?: string;
  homePage?: string;
  description?: string;
  [key: string]: any;
}

interface PreferenceStorage {
  accounts: AccountPreference[];
  defaultPluginId?: string | null;
  defaultAccountId?: string;
  showQuickResponseCode: boolean;
  showLineNumber: boolean;
  liveRendering: boolean;
}
