import { BaseUseCase } from "@/_shared/domain/use-cases/base.usecase";


export interface AuthenticateUseCase extends BaseUseCase<void, Promise<void>> {
  execute(): Promise<void>;
}