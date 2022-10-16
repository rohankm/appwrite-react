import { useContext, useEffect } from 'react'
import { useFunction } from 'react-appwrite-hooks/functions'
import { AppwriteContext } from 'react-appwrite-hooks'
import { useForm } from 'react-hook-form'

type Props = {}

type Form = {
  numbers: string,
}

export default function FunctionsPage({ }: Props) {
  const [sum, execution] = useFunction<{ numbers: number[] }, { result: number }>('sum')
  const { register, handleSubmit } = useForm()

  const onSubmit = async (data: Form) => {
    await sum({ numbers: data.numbers.split(',').map(number => Number(number)) })
  }

  useEffect(() => {
    if (execution) {
      console.log("Execution changed", execution)
    }
  }, [execution])

  return (
    <form
      // @ts-ignore
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col m-auto space-y-4"
    >
      <input
        type="text"
        placeholder="Numbers"
        {...register("numbers")}
      />

      <button
        type="submit"
      >
        Execute
      </button>

      <span>
        Status: {execution?.status}
      </span>

      <span>
        Result: {execution?.data?.result}
      </span>
    </form>
  )
}