import * as React from "react";
import { I18nAccessError, useTranslation } from "@/lib/i18n";

function I18nAccessDenied() {
  const { t } = useTranslation(["common"]);
  return (
    <main>
      <h1>{t("common:error.accessDenied")}</h1>
    </main>
  );
}

type I18nErrorBoundaryProps = React.PropsWithChildren<{
  resetKey?: string;
}>;

type I18nErrorBoundaryState = {
  error: unknown;
};

export class I18nErrorBoundary extends React.Component<
  I18nErrorBoundaryProps,
  I18nErrorBoundaryState
> {
  state: I18nErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): I18nErrorBoundaryState {
    return { error };
  }

  componentDidUpdate(prevProps: I18nErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error instanceof I18nAccessError) {
      return <I18nAccessDenied />;
    }
    if (this.state.error) throw this.state.error;
    return this.props.children;
  }
}
