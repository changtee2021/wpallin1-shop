import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import type { AdminOptionGroupInput } from "@/domain/product-options";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAdminConfiguratorRules,
  fetchAdminCustomProjects,
  fetchAdminCustomSettings,
  fetchAdminFabrics,
  fetchCategories,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type {
  AdminConfiguratorPreviewRule,
  AdminCustomProjectRow,
  AdminFabricRow,
  ColorOption,
  FabricCollectionOption,
} from "@/services/admin-custom.service";
import type { CategoryDto } from "@/types/api/categories";

import {
  emptyPreviewRuleForm,
  type ProductFormState,
  type PreviewRuleFormState,
} from "./custom-utils";

type CustomAdminContextValue = {
  loading: boolean;
  loadingProject: boolean;
  authOpts: ReturnType<typeof authServerFnOptions>;
  session: ReturnType<typeof useAuth>["session"];
  productId: string;
  projects: AdminCustomProjectRow[];
  categories: CategoryDto[];
  optionGroups: AdminOptionGroupInput[];
  fabrics: AdminFabricRow[];
  collections: FabricCollectionOption[];
  colors: ColorOption[];
  previewRules: AdminConfiguratorPreviewRule[];
  ruleForm: PreviewRuleFormState;
  setRuleForm: React.Dispatch<React.SetStateAction<PreviewRuleFormState>>;
  productForm: ProductFormState;
  setProductForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
  loadProject: (nextProductId?: string) => Promise<void>;
  reloadProjects: () => Promise<void>;
  reloadRules: () => Promise<void>;
  reloadFabrics: () => Promise<void>;
};

const CustomAdminContext = createContext<CustomAdminContextValue | null>(null);

export function CustomAdminProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const authOpts = authServerFnOptions(session);

  const [loading, setLoading] = useState(true);
  const [loadingProject, setLoadingProject] = useState(false);
  const [productId, setProductId] = useState("");
  const [projects, setProjects] = useState<AdminCustomProjectRow[]>([]);
  const [productForm, setProductForm] = useState<ProductFormState>({
    name: "",
    slug: "",
    categoryId: "",
    isActive: true,
  });
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [optionGroups, setOptionGroups] = useState<AdminOptionGroupInput[]>([]);
  const [fabrics, setFabrics] = useState<AdminFabricRow[]>([]);
  const [collections, setCollections] = useState<FabricCollectionOption[]>([]);
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [previewRules, setPreviewRules] = useState<
    AdminConfiguratorPreviewRule[]
  >([]);
  const [ruleForm, setRuleForm] = useState<PreviewRuleFormState>(
    emptyPreviewRuleForm(),
  );

  const loadProject = useCallback(
    async (nextProductId?: string) => {
      setLoadingProject(true);
      try {
        const settings = await fetchAdminCustomSettings({
          data: { productId: nextProductId },
          ...authOpts,
        });
        setProductId(settings.productId);
        setProductForm({
          name: settings.productName,
          slug: settings.productSlug,
          categoryId: settings.categoryId ?? "",
          isActive: settings.isActive,
        });
        setOptionGroups(settings.optionGroups);
        const ruleData = await fetchAdminConfiguratorRules({
          data: { productId: settings.productId },
          ...authOpts,
        });
        setPreviewRules(ruleData.previewRules);
        setRuleForm(emptyPreviewRuleForm());
      } finally {
        setLoadingProject(false);
      }
    },
    [authOpts],
  );

  const reloadFabrics = useCallback(async () => {
    const fabricData = await fetchAdminFabrics(authOpts);
    setFabrics(fabricData.fabrics);
    setCollections(fabricData.collections);
    setColors(fabricData.colors);
  }, [authOpts]);

  const reloadProjects = useCallback(async () => {
    const projectList = await fetchAdminCustomProjects(authOpts);
    setProjects(projectList);
  }, [authOpts]);

  const reloadRules = useCallback(async () => {
    if (!productId) return;
    const ruleData = await fetchAdminConfiguratorRules({
      data: { productId },
      ...authOpts,
    });
    setPreviewRules(ruleData.previewRules);
  }, [authOpts, productId]);

  useEffect(() => {
    void (async () => {
      try {
        const [projectList, fabricData, categoryList] = await Promise.all([
          fetchAdminCustomProjects(authOpts),
          fetchAdminFabrics(authOpts),
          fetchCategories(),
        ]);
        setProjects(projectList);
        setFabrics(fabricData.fabrics);
        setCollections(fabricData.collections);
        setColors(fabricData.colors);
        setCategories(categoryList);
        await loadProject(projectList[0]?.id);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, [session?.access_token]);

  const value = useMemo(
    () => ({
      loading,
      loadingProject,
      authOpts,
      session,
      productId,
      projects,
      categories,
      optionGroups,
      fabrics,
      collections,
      colors,
      previewRules,
      ruleForm,
      setRuleForm,
      productForm,
      setProductForm,
      loadProject,
      reloadProjects,
      reloadRules,
      reloadFabrics,
    }),
    [
      loading,
      loadingProject,
      authOpts,
      session,
      productId,
      projects,
      categories,
      optionGroups,
      fabrics,
      collections,
      colors,
      previewRules,
      ruleForm,
      productForm,
      loadProject,
      reloadProjects,
      reloadRules,
      reloadFabrics,
    ],
  );

  return (
    <CustomAdminContext.Provider value={value}>
      {children}
    </CustomAdminContext.Provider>
  );
}

export function useCustomAdmin() {
  const ctx = useContext(CustomAdminContext);
  if (!ctx) {
    throw new Error("useCustomAdmin must be used within CustomAdminProvider");
  }
  return ctx;
}
