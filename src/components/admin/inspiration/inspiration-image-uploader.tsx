import { AdminImageUploader } from "@/components/admin/shared/admin-image-uploader";
import type { authServerFnOptions } from "@/lib/server-fn-auth";

type AuthOpts = ReturnType<typeof authServerFnOptions>;

type Props = {
  accessToken: string | undefined;
  authOpts?: AuthOpts;
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  label?: string;
};

export function InspirationImageUploader({
  accessToken,
  authOpts,
  imageUrl,
  onImageUrlChange,
  label = "รูปภาพห้อง",
}: Props) {
  return (
    <AdminImageUploader
      accessToken={accessToken}
      authOpts={authOpts}
      mediaFolder="inspiration"
      imageUrl={imageUrl}
      onImageUrlChange={onImageUrlChange}
      uploadEndpoint="/api/v1/inspiration-image"
      label={label}
    />
  );
}
