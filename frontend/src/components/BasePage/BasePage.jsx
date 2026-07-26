import MainLayout from "../../layouts/MainLayout";
import PageHeader from "../PageHeader/PageHeader";

function BasePage({
  title,
  subtitle,
  buttonLabel,
  onButtonClick,
  children,
}) {
  return (
    <MainLayout>
      <PageHeader
        title={title}
        subtitle={subtitle}
        buttonLabel={buttonLabel}
        onButtonClick={onButtonClick}
      />

      {children}
    </MainLayout>
  );
}

export default BasePage;