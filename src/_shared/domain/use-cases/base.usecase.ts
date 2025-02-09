export interface BaseUseCase<Input, Output> {
  execute(input: Input): Output;
}