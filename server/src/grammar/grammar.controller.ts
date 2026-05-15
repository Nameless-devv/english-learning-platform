import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GrammarService } from './grammar.service';
import { GenerateGrammarDto } from './dto/generate-grammar.dto';

@Controller('grammar')
@UseGuards(AuthGuard('jwt'))
export class GrammarController {
  constructor(private grammarService: GrammarService) {}

  @Post('generate')
  generate(@Body() dto: GenerateGrammarDto) {
    return this.grammarService.generate(dto);
  }
}
