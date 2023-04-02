import { Field } from 'formik';
import { useAction } from 'js-game/api-tools';
import { GameFormik } from 'js-game/components/GameFormik';
import { Stack } from 'js-game/components/ui';
import { FC } from 'react';
import * as actions from '../pages/home/actions';

export const CreateCity: FC = () => {
  const { createCity } = useAction(actions);

  const initialValues = { city: '' };

  return (
    <GameFormik initialValues={initialValues} onSubmit={createCity}>
      {({ isSubmitting }) => (
        <Stack spacing={1}>
          <Field name="city" placeholder="Город" />
          <button type="submit">Создать</button>
        </Stack>
      )}
    </GameFormik>
  );
};
