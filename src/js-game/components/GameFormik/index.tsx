import { Form, Formik, FormikValues } from 'formik';
import { FC } from 'react';
import { Stack } from '../ui';

export const GameFormik: FC<FormikValues> = ({ initialValues, onSubmit, validate, children }) => {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values) => {
        await onSubmit(values);
      }}
      validate={validate}
    >
      {({ isSubmitting }) => (
        <Form>
          <Stack>{children({ isSubmitting })}</Stack>
        </Form>
      )}
    </Formik>
  );
};
